const { ProjectMember } = require('../models');

class ProjectMemberController {

    // GET all project members
    static async getAll(req, res) {
        try {
            const members = await ProjectMember.findAll();
            res.json(members);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    // GET member by id
    static async getById(req, res) {
        try {
            const member = await ProjectMember.findByPk(req.params.id);
            if (!member) return res.status(404).json({ message: "Member not found" });

            res.json(member);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    // CREATE member
    static async create(req, res) {
        try {
            const newMember = await ProjectMember.create(req.body);
            res.status(201).json(newMember);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    // UPDATE member
    static async update(req, res) {
        try {
            const member = await ProjectMember.findByPk(req.params.id);
            if (!member) return res.status(404).json({ message: "Member not found" });

            await member.update(req.body);
            res.json(member);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    // DELETE member
    static async delete(req, res) {
        try {
            const member = await ProjectMember.findByPk(req.params.id);
            if (!member) return res.status(404).json({ message: "Member not found" });

            await member.destroy();
            res.json({ message: "Member deleted" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}

module.exports = ProjectMemberController;
