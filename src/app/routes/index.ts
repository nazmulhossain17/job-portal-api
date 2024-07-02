import express from 'express';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { CandidateRoutes } from '../modules/candidate/candidate.routes';
import { RecruiterRoutes } from '../modules/recruiter/recruiter.routes';
import { jobRoutes } from '../modules/job/job.routes';

const router = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/candidate',
    route: CandidateRoutes,
  },
  {
    path: '/recruiter',
    route: RecruiterRoutes,
  },
  {
    path: '/job',
    route: jobRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
