class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll() {
    return this.model.find({});
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findOne(filter) {
    return this.model.findOne(filter);
  }

  async create(data) {
    return this.model.create(data);
  }

  async deleteById(id) {
    return this.model.deleteOne({ _id: id });
  }
}

export default BaseRepository;
