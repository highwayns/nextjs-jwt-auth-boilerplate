# NextJS JWT authentication boilerplate<!-- omit in toc -->

## Table of Contents<!-- omit in toc -->

- [1. Introduction](#1-introduction)
- [2. Working demo](#2-working-demo)
- [3. Description](#3-description)
- [4. Tech Stack](#4-tech-stack)
- [5. Getting Started](#5-getting-started)
  - [5.1. Prerequisites](#51-prerequisites)
  - [5.2. Configuration](#52-configuration)
    - [5.2.1. Install required packages](#521-install-required-packages)
    - [5.2.2. (Optional) Create a new PostgreSQL container with Docker](#522-optional-create-a-new-postgresql-container-with-docker)
    - [5.2.3. Copy the `.env.example` file to `.env` and fill in the required environment variables](#523-copy-the-envexample-file-to-env-and-fill-in-the-required-environment-variables)
    - [5.2.4. Push database schema and seed data to the database](#524-push-database-schema-and-seed-data-to-the-database)
    - [5.2.5. Start the development server a](#525-start-the-development-server-a)
- [6. Authentication flow](#6-authentication-flow)
  - [6.1. The `useAuth` hook](#61-the-useauth-hook)
  - [6.2. Route protection](#62-route-protection)
  - [6.3. JWT tokens](#63-jwt-tokens)
- [7. Screenshots and short demo](#7-screenshots-and-short-demo)

## 1. Introduction

This project was developed to show an example of JWT token-based authentication in a Web environment for a research project at the University of Applied Sciences of Southern Switzerland. You can find the related paper [here](./paper/README.md)

## 2. Working demo

Based on this boilerplate, I developed a PWA based on the [Chinook database](https://github.com/lerocha/chinook-database) that allows an Employee to view a list of his or her customers.

[Demo project link](https://github.com/lucadibello/nextjs-customer-manager)

## 3. Description

This NextJS 13 boilerplate comes with a fully functional two-factor authentication system based on JWT tokens.

Main features:

- Fully-typed with TypeScript
- Login with email and password (hashed with bcrypt)
- Role-based access control (by default: *User*, *Admin*)
- Automatic JWT access token refresh
- Two-factor authentication via email
- Front-end `useAuth` hook to easily manage the user session
- User session persistence via cookies and local storage
- New flexible back-end middleware management system
- Protected routes and pages

## 4. Tech Stack

- [NextJS v13](https://nextjs.org/), based on [ReactJS v17](https://reactjs.org/)
- [TypeScript v4.8](https://www.typescriptlang.org/)
- [Chakra UI](https://chakra-ui.com/)
- [React Hook Form](https://react-hook-form.com/)
- [SWR](https://swr.vercel.app/) (stale-while-revalidate)
- [Prisma v4.6](https://www.prisma.io/)

## 5. Getting Started

### 5.1. Prerequisites

- Node.js v14.17.0 or higher
- Yarn v1.22.10 or higher
- PostgreSQL v13.3 or higher

### 5.2. Configuration

#### 5.2.1. Install required packages

```sh
yarn install
```

#### 5.2.2. (Optional) Create a new PostgreSQL container with Docker
  
```sh
docker run --name nextjs-jwt-auth -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

#### 5.2.3. Copy the `.env.example` file to `.env` and fill in the required environment variables

```sh
cp .env.example .env.local 
```

#### 5.2.4. Push database schema and seed data to the database
  
```sh
yarn prisma db push && yarn prisma db seed
```

#### 5.2.5. Start the development server a

```sh
yarn dev
```

## 6. Authentication flow

The authentication flow is the following:

![Authentication flow](./paper/images/demo/demo_auth_flow.jpeg)

The chart is self-explanatory, but to better understand the flow, we can see the following steps:

1. The user sends a request to the `/api/login` endpoint, submitting the E-Mail address and password of the user in the request body. The server then validates the user credentials and, if valid, generates a JWT access token and a JWT refresh token. The access token is used to access the protected resources, while the refresh token is used to obtain a new access token when the current access token expires. The access token is sent in the response body, while the refresh token is sent in the response cookies. After that, the server sends an E-Mail to the user with a token used as OTP (one-time password) for the two-factor authentication.

2. The user cannot access the protected resources until the two-factor authentication in completed.

3. The user sends a GET request to `/api/two-factor` passing the two-factor authentication code sent via E-Mail in the request query with name `token`. The server validates the token and, if valid, the is authenticated and can access the protected resources using the access token generated in step 1. This is a sample two-factor authentication URL:

  ```url
  https://my-awesome-app.com/two-factor?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJsdWNhNjQ2OUBnbWFpbC5jb20iLCJuYW1lIjoiSmFuZSIsInN1cm5hbWUiOiJXaGl0ZSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTY2OTU0Mjk3MiwiZXhwIjoxNjY5NTQzODcyfQ.swKDoKXq72NOzOmRj781_X1EiH2pw2F-BEJiMXkE8xI
  ```

4. The user can now access the protected resources using the access token generated in step 1. The access token is stored inside a cookie named "token".

5. When the access token expires, the user can obtain a new access token by sending a POST request to the `/api/refresh` endpoint with a payload containing the refresh token.


```json
{
  "refreshToken": "my-secret-refresh-token"
}
```

The server then validates the refresh token and, if valid, generates a new access token and updates the user's access token cookie value using [Set-Cookie header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie). This process is done automatically inside the NextJS application by the `useAuth` hook.

### 6.1. The `useAuth` hook

The `useAuth` hook is a React hook that can be used to easily manage the user session. It is used to authenticate users, to get the user session information, to refresh the access token, to logout users, and to check if the user is authenticated.

The `useAuth` hook is defined in the `providers/auth/AuthProvider.tsx` file and is used in the `pages/_app.tsx` file to wrap the entire application. This is the list of the features provided by the `useAuth` hook:

- `currentUser`: The current user session information, such as the user ID, E-Mail address, name, surname and role
- `accessToken`: The JWT access token used to access the protected resources
- `refreshToken`: The JWT refresh token used to obtain a new access token when the current access token expires
- `isAuthenticated`: A boolean value that indicates if the user is authenticated
- `login(username: string, password: string)`: A function that can be used to authenticate users
- `logOut()`: A function that can be used to logout the user
- `refreshSession()`: A function that can be used to refresh the user session

### 6.2. Route protection

To protect access to the protected resources, have been used two different approaches:

- Middleware (**/middleware.ts**) that check if the user has set the access token in the cookies and, if not, redirects the user to the login page

- Server-side rendering (SSR) function that checks the user's access token validity and, if not valid, redirects the user to the login page

### 6.3. JWT tokens

The JWT access token and the JWT refresh token have the following payload:

```json
{
  "sub": <user id>,
  "email": <user email>,
  "name": <user first name>,
  "surname": <user last name>,
  "role": <user role: ADMIN or USER>,
  "iat": <issued at timestamp>,
  "exp": <expire at timestamp>,
  "iss": "${APP_URL}", // ENVIRONMENT VARIABLE
}
```

The JWT access token expires after 15 minutes, while the JWT refresh token expires after 30 days. Both tokens are signed using different secret keys to increase security.

Both tokens shares the same payload structure to permit the server to do extra checks on the token validity. If the user saved in the database is not the same user that is present in the token payload, the token is not valid. This has been done to prevent the user from using a token with old / invalid user information.

## 7. Screenshots and short demo

**Demo video using two accounts at the same time:**

https://user-images.githubusercontent.com/37295664/204390061-54322bd4-0bd0-426a-bff4-ee868534ae86.mp4

**Dashboard page:**
![Dashboard page](./paper/images/demo/demo_dashboard.png)

**Login page:**

![Login page](./paper/images/demo/demo_login.png)

**Two-factor authentication pages:**

Two-Factor authentication landing page:
![Two-Factor landing page](./paper/images/demo/demo_two_factor_info.png)

Two-Factor authentication success page:
![Two-Factor landing page](./paper/images/demo/demo_two_factor_success.png)

Two-Factor authentication error page:
![Two-Factor landing page](./paper/images/demo/demo_two_factor_error.png)
