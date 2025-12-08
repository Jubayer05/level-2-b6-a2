import { Router } from "express";
import auth from "../../middleware/auth";
import { vehicleController } from "./vehicle.controller";

const router = Router();

router.post("/", auth("admin"), vehicleController.createVehicle);

router.get("/", vehicleController.getAllVehicle);

router.get("/:vehicleId", vehicleController.getSingleVehicle);

router.put("/:vehicleId", auth("admin"), vehicleController.updateVehicle);

router.delete("/:vehicleId", auth("admin"), vehicleController.deleteVehicle);

export const vehicleRoutes = router;
