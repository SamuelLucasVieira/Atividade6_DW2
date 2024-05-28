import { Request, Response } from "express";
import query from "../database/connection";

class SpentController {
  public async create(req: Request, res: Response): Promise<void> {
    const { idproduct, value } = req.body;
    const { id:iduser } = res.locals;
    const r:any = await query(
      "INSERT INTO spents(iduser,idproduct,value) VALUES ($1,$2,$3) RETURNING id,idproduct as product,datetime,value",
      [iduser, idproduct, value]
    );
    res.json(r);
  }

  public async statcByProduct(req: Request, res: Response): Promise<void> {
    const r:any = await query(
      `SELECT b.name AS name,ROUND(AVG(a.value),2)::FLOAT AS avg,CAST(COUNT(b.name) AS INT) AS count, Max(a.value::float) as max,MIN(a.value::float) AS min
      FROM spents AS a LEFT JOIN products AS b
      ON a.idproduct = b.id
      group by b.name
      ORDER BY b.name ASC
       `
    );  
    res.json(r);
    console.log(r)
  }

  public async  statsByUser(req: Request, res: Response): Promise<void> {
    const r:any = await query(
      `SELECT a.mail, ROUND(sum(b.value),2)::FLOAT AS sum,ROUND(count(b.value::float),0)::FLOAT as count
       FROM users AS a 
       LEFT JOIN spents AS B ON a.id = b.iduser 
       group by a.mail 
       order by a.mail asc
      `
    )
    res.json(r);
    console.log(r)
  }

  public async list(req: Request, res: Response): Promise<void> {
    const { id:iduser } = res.locals;
    const page = parseInt(req.params.page) || 1;
        const countResult: any = await query(
            `SELECT COUNT(*) as count, AVG(value::FLOAT) as average
             FROM spents
             WHERE iduser = $1`,
            [iduser]
        );
        const total = parseInt(countResult[0].count);
        const averageSpent = parseFloat(countResult[0].average).toFixed(2);
        console.log(countResult[0].average)
        const totalPages = Math.ceil(total / 5);
        console.log(totalPages)
        const currentPage = page > totalPages ? totalPages : page;
        console.log(currentPage)
        const offset = (currentPage - 1) * 5;
        const r: any = await query(
            `SELECT a.id, b.name, a.value::FLOAT, a.datetime
             FROM spents AS a LEFT JOIN products AS b
             ON a.idproduct = b.id
             WHERE iduser = $1
             ORDER BY a.datetime DESC
             LIMIT 5 OFFSET $2`,
            [iduser, offset]
        );

        res.json({
            pages: totalPages,
            page: currentPage,
            count: total,
            average: averageSpent,
            spent: r,
        });
    }


  public async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.body; 
    const { id:iduser } = res.locals;

    const r:any = await query(
      "DELETE FROM spents WHERE id = $1 AND iduser=$2 RETURNING id,idproduct as product,value,datetime", 
      [id, iduser]
    );
    if( r.rowcount > 0 ){
      res.json(r.rows);
    }
    else{
      res.json({ message: "Registro inexistente" });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    const { id, product, value } = req.body;
    const { id:iduser } = res.locals;
    const r:any = await query(
      "UPDATE spents SET idproduct=$3, value=$4 WHERE id=$1 AND iduser=$2 RETURNING id,idproduct as product,value,datetime", 
      [id,iduser,product,value]
    );

    if( r.rowcount > 0 ){
      res.json(r.rows);
    }
    else if ( r.rowcount === 0 ){
      res.json({ message: "Registro inexistente" });
    }
    else{
      res.json({ message: r.message });
    }
  }
}

export default new SpentController();
