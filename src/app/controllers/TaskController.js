import * as Yup from 'yup';

import User from '../models/User';
import Task from '../models/Task';

function isValidMongoDbID(str) {
  const checkForValidMongoDbID = new RegExp('^[0-9a-fA-F]{24}$');
  return checkForValidMongoDbID.test(str);
}

function taskExist(task_list, task_id) {
  return task_list.includes(task_id);
}

// criar controller novo para score
function taskScore(task) {
  let point = task.todo_list.length * 10;

  if (point > 100) point = 100;
  // state?
  if (Date.now > task.due_date) point *= 0.25;

  const user = User.findById(task.user_id);
  user.exp += point;
  user.updateOne(user);
}

class TaskController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string().required(),
      due_date: Yup.date().notRequired(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).send({ message: 'Validation error' });

    req.body.user_id = req.user_id;

    try {
      const task = await Task.create(req.body);
      const user = await User.findById(req.user_id);
      user.tasks.push(task);
      await user.updateOne(user);

      return res.send(task);
    } catch (err) {
      return res.status(400).send({ err });
    }
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      task_id: Yup.string().required(),
    });

    if (
      !(await schema.isValid(req.body)) ||
      !isValidMongoDbID(req.body.task_id)
    )
      return res.send({ message: 'Validation error' });

    const { tasks } = await User.findById(req.user_id);
    const task_id = tasks.filter((item) => {
      return item === req.body.task_id;
    });

    const task = await Task.findById(task_id);

    return res.send(task);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      task_id: Yup.string().required(),
    });

    const { task_id } = req.body;

    if (!(await schema.isValid(req.body)) || !isValidMongoDbID(task_id))
      return res.status(400).send({ message: 'Validation error' });

    const user = await User.findById(req.user_id);
    let { tasks } = user;

    if (!taskExist(tasks, task_id))
      return res.status(400).send({ message: 'Task not found' });

    tasks = tasks.filter((id) => {
      return id !== task_id;
    });

    user.tasks = tasks;

    await user.updateOne(user);

    return res.send(user);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.string().required(),
      name: Yup.string().notRequired(),
      description: Yup.string().notRequired(),
      due_date: Yup.date().notRequired(),
      active: Yup.boolean().notRequired(),
    });

    const { id, name, description, due_date, active } = req.body;

    if (!(await schema.isValid(req.body)) || !isValidMongoDbID(id))
      return res.status(400).send({ message: 'Validation error' });

    const user = await User.findById(req.user_id);
    const { tasks } = user;

    if (!taskExist(tasks, id))
      return res.status(400).send({ message: 'Task not found' });

    const task = await Task.findById(req.body.id);
    if (name !== undefined) task.name = name;

    if (description !== undefined) task.description = description;

    if (due_date !== undefined) task.due_date = due_date;

    if (active !== undefined && active !== task.active) {
      task.active = active;
      taskScore(task);
    }

    await task.updateOne(task);
    return res.send(task);
  }

  async todo_list(req, res) {
    const schema = Yup.object().shape({
      id: Yup.string().required(),
    });

    const { id } = req.body;

    if (!(await schema.isValid(req.body)) || !isValidMongoDbID(id))
      return res.status(400).send({ message: 'Validation error' });

    const user = await User.findById(req.user_id);
    const { tasks } = user;

    if (!taskExist(tasks, id))
      return res.status(400).send({ message: 'Task not found' });

    const task = await Task.findById(id);
    return res.send(task.todo_list);
  }
}

export default new TaskController();
