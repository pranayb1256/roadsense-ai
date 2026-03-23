import {Router} from "express"
import {prisma} from "../config/db"
import axios from "axios"
const router = Router()

router
.route('/potholes')
.post(async(req,res)=>
{
    const {lat,lng,vibration,speed}=req.body;
    const severityScore = vibration / speed;
    let severity = "smooth";
    if (severityScore > 1) {
        severity = "dangerous";
    }
    else if (severityScore > 0.5) {
        severity = "moderate";
    }
    else if (severityScore > 0.2) {
        severity = "mild";
    }
    const pothhole = await prisma.$queryRaw`
    INSERT INTO "Pothole" (latitude,longitude,vibration,speed,location)
    VALUES (${lat}, ${lng}, ${vibration}, ${speed},ST_MakePoint(${lng}, ${lat})::geography)
    RETURNING *;
    `    
    res.json({pothhole,severity});
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
  const response = await axios.post("http://localhost:8000/cluster", {coordinates: coords});
  const clusters = response.data.clusters;
  const formatted = clusters.map((c: any)=>({
    ...c,
    color:
     c.severity === "dangerous" ? "red":
     c.severity==="bad"?"orange":
     c.severity==="moderate"?"yellow":
     "green "
  }))
  res.json(formatted) ;
})
router.route("/potholes/heatmap")
.get(async(req,res)=>
{
  const potholes = await prisma.pothole.findMany();
  const grid: any = {}
  potholes.forEach(p=>{
    const key = `${Math.round(p.latitude*100)/100},${Math.round(p.longitude*100)/100}`;
    if(!grid[key])
    {
      grid[key] ={
        lat:p.latitude,
        lng:p.longitude,
        totalVibration:0,
        count:0
      };
    }
    grid[key].totalVibration += p.vibration;
    grid[key].count+=1
  })
  const result = Object.values(grid).map((cell:any)=>
  {
    const score = cell.totalVibration / cell.count;
    let severity = "smooth";
    if(score>8) severity = "dangerous";
    else if(score>5) severity = "bad";
    else if(score>2) severity = "moderate";
    return {
      latitude:cell.lat,
      longitude:cell.lng,
      severity,
      score
    }
  })
  res.json(result)
})
export default router