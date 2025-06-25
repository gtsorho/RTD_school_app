import { Router } from 'express';
import authenticateJWT from '../middleware/auth';
import { upload } from '../middleware/upload';
import teacher from '../controllers/teacher';
import classes from '../controllers/class';
import student from '../controllers/student';
import subject from '../controllers/subject';
import term from '../controllers/term';
import searchController from '../controllers/search';
import userController from '../controllers/user';
import accadamic_year from '../controllers/accadamic_year';
import assessmentController from '../controllers/assessment';
import finalAssessmentController from '../controllers/final_assessment';
import assessmentScoreController from '../controllers/assessment_score';
const router = Router();

// User Management Routes
router.get('/users', authenticateJWT(['admin']), userController.getAll);
router.post('/login', userController.login);
router.post('/users', authenticateJWT(['admin']), upload.single('image'), userController.create);
router.get('/users', authenticateJWT(['admin']), userController.getOne);
router.get('/auth', authenticateJWT(['admin']), userController.authUser);
router.put('/users/:id', authenticateJWT(['admin']), upload.single('image'), userController.update);
router.delete('/users/:id', authenticateJWT(['admin']), userController.delete);

// Teacher Management Routes
router.post('/teachers', authenticateJWT(['admin']), teacher.create);
router.get('/teachers/:id', authenticateJWT(['admin']), teacher.getOne);
router.get('/auth/teacher/:id', authenticateJWT(['admin', 'user']), teacher.getOneByUserId);
router.get('/teachers', authenticateJWT(['admin']), teacher.getAll);
router.delete('/teachers/:id', authenticateJWT(['admin']), teacher.delete);
router.put('/teachers/:id', authenticateJWT(['admin']), teacher.update);


// Class Management Routes
router.post('/classes', authenticateJWT(['admin']), classes.create);
router.get('/classes', authenticateJWT(['admin', 'user']), classes.getAll);
router.delete('/classes/:id', authenticateJWT(['admin']), classes.delete);
router.get('/classes/:id', authenticateJWT(['admin']), classes.getOne);
router.put('/classes/:id', authenticateJWT(['admin']), classes.update);

// Student Management Routes
router.post('/students', authenticateJWT(['admin']), upload.single('image'), student.create);
router.get('/students', authenticateJWT(['admin', 'user']), student.getAll);
router.get('/students/export', authenticateJWT(['admin']), student.exportToExcel);
router.delete('/students/:id', authenticateJWT(['admin']), student.delete);
router.get('/students/:id', authenticateJWT(['admin', 'user']), student.getOne);
router.put('/students/:id', authenticateJWT(['admin']), upload.single('image'), student.update);
router.post('/student_login', student.login);
router.get('/student_auth', authenticateJWT(['admin', 'user']), student.authStudent);
router.post('/students/import', authenticateJWT(['admin']), upload.single('file'), student.importFromExcel);

// Academic Year Management Routes
router.post('/years', authenticateJWT(['admin']), accadamic_year.create);
router.get('/years', authenticateJWT(['admin']), accadamic_year.getAll);
router.get('/years/active', authenticateJWT(['admin']), accadamic_year.getActive);
router.delete('/years/:id', authenticateJWT(['admin']), accadamic_year.delete);
router.put('/years/:id', authenticateJWT(['admin']), accadamic_year.update);

// Subject Management Routes
router.post('/subjects', authenticateJWT(['admin']), subject.create);
router.get('/subjects', authenticateJWT(['admin']), subject.getAll);
router.get('/subjects/:id', authenticateJWT(['admin']), subject.getOne);
router.delete('/subjects/:id', authenticateJWT(['admin']), subject.delete);
router.put('/subjects/:id', authenticateJWT(['admin']), subject.update);

// Term Management Routes
router.post('/terms', authenticateJWT(['admin']), term.create);
router.get('/terms', authenticateJWT(['admin']), term.getAll);
router.get('/terms/:id', authenticateJWT(['admin']), term.getOne);
router.delete('/terms/:id', authenticateJWT(['admin']), term.delete);
router.put('/terms/:id', authenticateJWT(['admin']), term.update);


// Assessment Management Routes

router.post('/assessments', authenticateJWT(['admin']), assessmentController.create);
router.get('/assessments', authenticateJWT(['admin']), assessmentController.getAll);
router.get('/assessments/:id', authenticateJWT(['admin']),assessmentController.getOne);
router.put('/assessments/:id', authenticateJWT(['admin']), assessmentController.update);
router.delete('/assessments/:id', authenticateJWT(['admin']), assessmentController.delete);

// Final Assessment Management Routes
router.post('/final_assessments', authenticateJWT(['admin']), finalAssessmentController.create);
router.get('/final_assessments', authenticateJWT(['admin']), finalAssessmentController.getAll);
router.get('/final_assessments/:id', authenticateJWT(['admin']), finalAssessmentController.getOne);
router.put('/final_assessments/:id', authenticateJWT(['admin']), finalAssessmentController.update);
router.delete('/final_assessments/:id', authenticateJWT(['admin']), finalAssessmentController.delete);

// Assessment Score Management Routes
router.post('/assessment_scores', authenticateJWT(['admin']), assessmentScoreController.create);
router.get('/assessment_scores', authenticateJWT(['admin']), assessmentScoreController.getAll);
router.get('/assessment_scores/:id', authenticateJWT(['admin']), assessmentScoreController.getOne);
router.put('/assessment_scores/:id', authenticateJWT(['admin']), assessmentScoreController.update);
router.delete('/assessment_scores/:id', authenticateJWT(['admin']), assessmentScoreController.delete);

// Search Route for Dynamic Queries
router.get('/search/student', authenticateJWT(['user']), student.getFiltered);

router.get('/search', authenticateJWT(['user']), searchController.search);

export default router;
