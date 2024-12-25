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

  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  async create(data) {
    return this.model.create(data);
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }
}

export default BaseRepository;
