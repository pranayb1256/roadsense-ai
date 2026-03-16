import {Router} from "express"
import {prisma} from "../config/db"

const router = Router()

router
.route('/potholes')
.post(async(req,res)=>
{
    const {lat,lng,vibration,speed}=req.body;
    const pothole= await prisma.pothole.create({
        data:{
            latitude:lat,
            longitude:lng,
            vibration,
            speed
        }
    })

    res.json(pothole)
})

router
.route("/potholes")
.get(async(req,res)=>
{
    const pothole = await prisma.pothole.findMany();
    res.json(pothole);
})

export default router