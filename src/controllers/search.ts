import { Request, Response } from 'express';
import db from '../models';
import { Op } from 'sequelize';

/**
 * Parses the query path (e.g., "user->category->asset") and builds Sequelize include structure.
 */
const buildInclude = (pathArray: string[]) => {
    let include :any = [];
    let currentInclude = include;

    pathArray.slice(1).forEach((modelName) => {
        if (!db[modelName]) {
            throw new Error(`Model "${modelName}" does not exist`);
        }

        const newInclude = {
            model: db[modelName],
            as: modelName, // Ensure your model relationships use `as` in associations.
            required: false,
            include: [],
        };

        currentInclude.push(newInclude);
        currentInclude = newInclude.include;
    });

    return include;
};

export default {
    async search(req: Request, res: Response) : Promise<any> {
        try {
            const { queryPath, filters, sort, page, limit } = req.query;

            if (!queryPath) {
                return res.status(400).json({ error: "Query path is required." });
            }

            const pathArray = (queryPath as string).split('->');
            const baseModelName = pathArray[0];

            if (!db[baseModelName]) {
                return res.status(400).json({ error: `Model "${baseModelName}" does not exist.` });
            }

            const include = buildInclude(pathArray);

            const where = filters ? JSON.parse(filters as string) : {};
            const order = sort ? JSON.parse(sort as string) : [['createdAt', 'DESC']];
            const pageNum = page ? parseInt(page as string) : 1;
            const pageSize = limit ? parseInt(limit as string) : 10;
            const offset = (pageNum - 1) * pageSize;

            const results = await db[baseModelName].findAll({
                where,
                include,
                order,
                limit: pageSize,
                offset,
            });

            res.status(200).json(results);
        } catch (error: any) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }
};
