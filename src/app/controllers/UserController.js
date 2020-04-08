import * as Yup from 'yup';
import bcrypt from 'bcryptjs';
import { isBefore, subYears, startOfYear, parseISO } from 'date-fns';

import User from '../models/User';

class UserController {
  //  Buscar usuário por nome
  async index(req, res) {
    //  Parametros de busca
    const { name, page = 1 } = req.query;

    //  Busca case insensitive com paginação de 10
    const user = await User.find({ name: new RegExp(`^${name}$`, 'i') })
      .skip((page - 1) * 10)
      .limit(10);

    //  Busca Vazia
    if (!user) {
      return res.status(401).json({ error: 'User name not found' });
    }

    //  Retorna o usuário
    return res.json(user);
  }

  //  Criar novo usuário
  async store(req, res) {
    //  Validação dos campos do body
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      birthday: Yup.date().required(),
      password: Yup.string().required().min(6),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });
    //  Campo inválido
    if (!(await schema.isValid(req.body)))
      return res.status(400).send({ message: 'Validation error' });

    //  Desestruturação do body
    const { name, email, birthday } = req.body;

    //  Buscar usuário por email
    const userExists = await User.findOne({ email });
    // Email indisponível
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    //  Limitar a idade mínima a 10 anos
    const ageLimit = startOfYear(subYears(new Date(), 10));
    //  Usuário muito novo
    if (isBefore(ageLimit, parseISO(birthday))) {
      return res
        .status(401)
        .json({ error: 'User must be at least 10 years old' });
    }

    //  Criptografando senha informada
    const password = await bcrypt.hash(req.body.password, 8);

    //  Criando usuário no banco
    const user = await User.create({ ...req.body, password });

    // Retornando usuário criado
    return res.json(user);
  }

  //  Atualizar dados do Usuário
  async update(req, res) {
    //  Validação dos campos do body
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      birthday: Yup.date(),
      avatar: Yup.string(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });
    //  Campo inválido
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    //  Desestruturação do body
    const { email, oldPassword } = req.body;

    //  Buscar usuário por id
    const user = await User.findById(req.userId).select('+password');

    // Comparando Emails
    if (email !== user.email) {
      //  Buscar usuário por email
      const userExists = await User.findOne({ email });
      // Email indisponível
      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    //  Comparando senhas
    if (oldPassword && !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    let newUser;

    //  Criando uma nova senha
    if (req.body.oldPassword) {
      const password = await bcrypt.hash(req.body.password, 8);
      //  Atualizado dados + nova senha
      newUser = await User.findOneAndUpdate(
        { _id: req.userId },
        { ...req.body, password },
        { new: true }
      );
    } else {
      //  Atualizando dados sem nova senha
      newUser = await User.findOneAndUpdate({ _id: req.userId }, req.body, {
        new: true,
      });
    }

    // return user
    return res.json(newUser);
  }

  //  Deletar conta do usuário
  async delete(req, res) {
    // Selecionar  pelo ID e sobrescrever dados sensiveis
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        deactivated: true,
        name: undefined,
        email: undefined,
        password: undefined,
        avatar: null,
        friend_list: {},
      },
      { new: true }
    );

    // Id não encontrado
    if (!user) return res.status(400).json({ message: 'User not found' });

    //  Deletado com sucesso
    return res.json({ message: 'Delete successfully' });
  }
}

export default new UserController();
