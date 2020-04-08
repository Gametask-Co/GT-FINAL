import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const url = `${process.env.STATIC_URL}/avatar/${this.path}`;

    const file = await File.create({ name, path, url });

    return res.json(file);
  }
}

export default new FileController();
