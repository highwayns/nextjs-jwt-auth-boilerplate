import { NextApiRequest, NextApiResponse } from 'next'

export type Middleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next?: Middleware
) => Promise<void> 