// eslint-disable-next-line @typescript-eslint/no-require-imports
const { body } = require('express-validator');

const userValidationRules = () => {
    return [
        body('username').notEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Must be a valid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('university').notEmpty().withMessage('University is required'),
    ];
};

const publicationValidationRules = () => {
    return [
        body('name').notEmpty().withMessage('Publication name is required'),
        body('subject').notEmpty().withMessage('Subject is required'),
        body('university').notEmpty().withMessage('University is required'),
        body('author').notEmpty().withMessage('Author is required'),
    ];
};

module.exports = {
    userValidationRules,
    publicationValidationRules,
};