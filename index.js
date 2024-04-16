const express = require("express");
const mysql = require("mysql");
const app = express();
const port = process.env.port || 3000;
const bodyParser = require("body-parser");
const cors= require('cors');
const multer = require('multer');
const path = require('path');


app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

const connection = mysql.createConnection({
  host: "43.225.55.114",
  user: "maniasuj_geolocation",
  password: "^mLM.IU}eEH~",
  database:"maniasuj_geolocation",
});

// 43.225.55.114
// $username = "maniasuj_geolocation";
// $password = "^mLM.IU}eEH~";
// $dbname = "maniasuj_geolocation";

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected");
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images'); // Store uploaded images in the 'images' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext); // Unique filename to prevent conflicts
  }
});


// Create Multer instance with specified storage options
const upload = multer({ storage: storage });
app.use('/images',express.static('images'))

app.get("/district",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_block` WHERE STATUS ='Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {

           
            res.json(results);
          }
        }
      );
})


app.get("/block",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_block` WHERE STATUS ='Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {

          
            res.json(results);
          }
        }
      );
})



app.get("/panchayat",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_panchayat` WHERE STATUS ='Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            
            res.json(results);
          }
        }
      );
})



app.get("/village",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_village` WHERE STATUS = 'Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {

         
            res.json(results);
          }
        }
      );
})


app.get("/projectArea",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_project_area` WHERE STATUS = 'Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {

  
            res.json(results);
          }
        }
      );
})



app.get("/activity",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_activity_type` WHERE STATUS = 'Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {

        
            res.json(results);
          }
        }
      );
})


app.get("/activityName",(req,res)=>{

    connection.query(
        "SELECT * FROM `master_activity` WHERE STATUS = 'Active'",
        (error, results) => {
          if (error) {
            console.log(error);
          } else {

          
            res.json(results);
          }
        }
      );
})


app.get("/verify", (req, res) => {
  const empId = req.query.empId; // Corrected variable name
  const password = req.query.password; // Corrected variable name
  console.log("Employee ID:", empId, password);


  

  const sql = 'SELECT * FROM employee WHERE emp_id = ? AND password = ?';
  connection.query(sql, [empId, password], function (err, result) {
    if (err) {
      console.log("Error executing query:", err);
      return res.status(500).send("Error executing query");
    } else {
      console.log("Query result:", result);
      return res.send(result);
    }
  });
});

app.post("/addProject", (req, res) => {
  const { emp_id, dist, block, panchayat, village, projectArea, activityType, activityName, imageArray,desc } = req.body;

console.log("imageArray",imageArray)

     

  const sqlInsertProject = `INSERT INTO project_detail 
                            (emp_id, dist, block, panchayat, village, project_area, activity_type, activity_name) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(sqlInsertProject, [emp_id, dist, block, panchayat, village, projectArea, activityType, activityName], (err, result) => {
    if (err) {
      console.error('Error inserting project data:', err);
      res.status(500).send('Error inserting project data into database');
      return;
    }

    const projectId = result.insertId;


    const pid = `PR000${projectId}`;

    const sqlUpdateProject = `UPDATE project_detail 
                              SET pid = ? 
                              WHERE id = ?`;

    connection.query(sqlUpdateProject, [pid, projectId], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Error updating project pid:', updateErr);
        res.status(500).send('Error updating project data in database');
        return;
      }


      
    const imageInsertPromises = imageArray.map(async (image) => {
      const { uri, latitude, longitude, dateTime } = image;


      const sqlInsertImage = `INSERT INTO image_detail 
                              (emp_id, pid, url, lat, longitude, description, date_time) 
                              VALUES (?, ?, ?, ?, ?, ?, ?)`;

      await connection.query(sqlInsertImage, [emp_id, pid, uri, latitude, longitude, desc, dateTime],(imageErr,imageResult)=>{
         if(imageErr){
          console.error('Error updating image pid:', imageErr);
          res.status(500).send('Error updating image data in database');
          return;
         }

      });
    });

      console.log('Project data inserted and pid updated successfully!');
      res.status(200).send('Project data inserted and pid updated successfully');
    });
  });
});



app.get("/",(req,res)=>{
     res.send("hello")
})


app.listen(port, () => {
  console.log("server is running", {port});
});


