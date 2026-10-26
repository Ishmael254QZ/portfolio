import { database } from '../config/database.js';

function mapProject(row) {
  return {
    ...row,
    features: JSON.parse(row.features),
    technologies: JSON.parse(row.technologies)
  };
}

const projectColumns = `
  id, title, category, status, description, problem, features, technologies,
  repository, demo, image, created_at AS createdAt, updated_at AS updatedAt
`;

export const projectModel = {
  list() {
    return database.prepare(`SELECT ${projectColumns} FROM projects ORDER BY id DESC`).all().map(mapProject);
  },

  findById(id) {
    const row = database.prepare(`SELECT ${projectColumns} FROM projects WHERE id = ?`).get(id);
    return row ? mapProject(row) : null;
  },

  create(project) {
    const result = database.prepare(`
      INSERT INTO projects
        (title, category, status, description, problem, features, technologies, repository, demo, image)
      VALUES
        (@title, @category, @status, @description, @problem, @features, @technologies, @repository, @demo, @image)
    `).run({
      ...project,
      features: JSON.stringify(project.features),
      technologies: JSON.stringify(project.technologies)
    });
    return this.findById(result.lastInsertRowid);
  },

  update(id, project) {
    const result = database.prepare(`
      UPDATE projects SET
        title = @title, category = @category, status = @status, description = @description,
        problem = @problem, features = @features, technologies = @technologies,
        repository = @repository, demo = @demo, image = @image,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `).run({
      ...project,
      id,
      features: JSON.stringify(project.features),
      technologies: JSON.stringify(project.technologies)
    });
    return result.changes ? this.findById(id) : null;
  },

  delete(id) {
    return database.prepare('DELETE FROM projects WHERE id = ?').run(id).changes > 0;
  }
};
