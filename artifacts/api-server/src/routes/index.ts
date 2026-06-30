import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jobsRouter from "./jobs";
import companiesRouter from "./companies";
import categoriesRouter from "./categories";
import statsRouter from "./stats";
import adminRouter from "./admin";
import newsletterRouter from "./newsletter";
import pagesRouter from "./pages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jobsRouter);
router.use(companiesRouter);
router.use(categoriesRouter);
router.use(statsRouter);
router.use(adminRouter);
router.use(newsletterRouter);
router.use(pagesRouter);

export default router;
