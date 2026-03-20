import { Pothole } from './../../../src/generated/prisma/client';
import {Router} from "express"
import {prisma} from "../config/db"
import axios from "axios"
const router = Router()

router
.route('/potholes')
.post(async(req,res)=>
{
    const {lat,lng,vibration,speed}=req.body;
    const pothhole = await prisma.$queryRaw`
    INSERT INTO "Pothole" (latitude,longitude,vibration,speed,location)
    VALUES (${lat}, ${lng}, ${vibration}, ${speed}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))
    RETURNING *;
    `    
    res.json(pothhole);
})
router.
route("/potholes/nearby")
.get(async(req,res)=>
{
    const {lat,lng,radius}=req.query;
    const potholes = await prisma.$queryRaw`
    SELECT * 
    FROM "Pothole"
    WHERE ST_DWithin(
      location,
      ST_MakePoint(${Number(lng)}, ${Number(lat)})::geography,
      ${Number(radius)}
    );
  `;
    res.json(potholes);
})
router
.route("/potholes")
.get(async(req,res)=>
{
    const pothole = await prisma.pothole.findMany();
    res.json(pothole);
})
router.route("/potholes/clustered")
.get(async(req,res)=>
{
  const potholes = await prisma.pothole.findMany();
  const coords = potholes.map(p=> [p.latitude, p.longitude]);
  const response = await axios.post("http://localhost:8000/cluster", {coords});
  res.json(response.data);
})
export default router