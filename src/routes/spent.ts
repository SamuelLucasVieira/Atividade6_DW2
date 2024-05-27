import { Router, Request, Response } from "express";
import controller from "../controllers/SpentController";
import { checkAdm } from "../middlewares";

const routes = Router();
routes.get("/listar", controller.list);
routes.get("/listar/:page", controller.list);
routes.get("/produtos",checkAdm,controller.staticByProduct);
routes.post("/", controller.create);
routes.delete("/", controller.delete);
routes.put("/", controller.update);

//aceita qualquer método HTTP ou URL
routes.use( (_:Request,res:Response) => res.json({error:"Operação desconhecida com o gasto"}) );

export default routes;