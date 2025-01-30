const { Router } = require('express')
const courseRouter = Router();


courseRouter.post('/purchase', async (req,res) => {
    res.json({message: 'purchase endpoint'})
})


courseRouter.get('/preview', async (req,res) => {
    res.json({message: 'preview endpoint'});
})


module.exports = { courseRouter: courseRouter }