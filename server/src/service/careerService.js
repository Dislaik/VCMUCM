const CareerRepository = require('../repository/careerRepository');

class CareerService {
  async getAll() {
    return await CareerRepository.findAll();
  }

  async getById(id) {
    const career = await CareerRepository.findById(id);
    
    if (career) {
      const restructuredCareer = career.toJSON();

      restructuredCareer.id_headquarter = restructuredCareer.headquarter;
      restructuredCareer.id_faculty = restructuredCareer.faculty;

      delete restructuredCareer.headquarter;
      delete restructuredCareer.faculty;

      return restructuredCareer;
    }

    throw new Error('Career not found');
  }

  async getByName(name) {
    const career = await CareerRepository.findByName(name);
    
    if (!career) {
      throw new Error('Career not found');
    }

    return career;
  }

  async getByLabel(label) {
    const career = await CareerRepository.findByLabel(label);
    
    if (!career) {
      throw new Error('Career not found');
    }

    return career;
  }

  async getByHeadquarterAndFacultyName(headquarterName, facultyName) {
    return await CareerRepository.findByHeadquarterAndFacultyName(headquarterName, facultyName);
  }

  async create(data) {
    return await CareerRepository.create(data);
  }

  async update(id, data) {
    return await CareerRepository.update(id, data);
  }

  async delete(id) {
    return await CareerRepository.delete(id);
  }

  async existsByName(name) {
    return await CareerRepository.existsByName(name);
  }
}

module.exports = new CareerService();