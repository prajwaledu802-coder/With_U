const asyncHandler = require('../utils/asyncHandler');
const { generateRoutine, getRoutine } = require('../services/routineService');

exports.generate = asyncHandler(async (req, res) => {
  const routine = await generateRoutine(req.user._id);
  res.json({ success: true, routine });
});

exports.get = asyncHandler(async (req, res) => {
  const routine = await getRoutine(req.user._id);
  res.json({ success: true, routine });
});
