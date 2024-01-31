import { NextFunction, Request, Response } from 'express';

export const AsyncHandler = (theFunction: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunction(req, res, next)).catch(next);
}