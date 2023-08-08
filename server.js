/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rutwik Bosmia Student ID: 115552226 Date: August-07-2023

********************************************************************************/
const path = require('path');
const collegeData = require('./modules/collegeData');
const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require('express-handlebars');
const { log } = require('console');



const HTTP_PORT = process.env.PORT || 8080;


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(__dirname + '/public'));
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
  next();
});
app.engine('hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main', helpers: {
  navLink: function (url, options) {
      return (
          '<li' +
          ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
          '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>'
      );
  },
  // Handlebars helper for equality check
  equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
  }
}, }));
app.set('view engine', 'hbs');




// Initialize collegeData module
collegeData.initialize()
  .then(() => {
    // Routes
    app.get('/students', (req, res) => {
      const { course } = req.query;
      if (course) {
        collegeData.getStudentsByCourse(course)
          .then((students) => {
            res.render("students", { students: students });
          })
          .catch((err) => {
            console.log(err);
            res.render("students", { message: 'no results' });
          });
      } else {
        collegeData.getAllStudents()
          .then((students) => {
            if (students.length > 0) {
              res.render("students", { students: students });
            } else {
              res.render("students", { message: 'no results' });
            }
          })
          .catch(() => {
            res.render("students", { message: 'no results' });
          });
      }
    });
    



    app.get('/tas', (req, res) => {
      collegeData.getTAs()
        .then((tas) => {
          res.json(tas);
        })
        .catch(() => {
          res.status(404).json({ message: 'no results' });
        });
    });

    app.get("/courses", function (req, res) {
      collegeData.getCourses()
        .then(function (data) {
          if (data.length > 0) {
            res.render("courses", { courses: data });
          } else {
            res.render("courses", { message: "no results" });
          }
        })
        .catch(function (err) {
          res.render("courses", { message: "no results" });
        });
    });
    
    

    app.get("/course/:id", (req, res) => {
      const courseId = parseInt(req.params.id);
      collegeData.getCourseById(courseId)
        .then((data) => {
          if (!data) {
            res.status(404).send("Course Not Found");
          } else {
            res.render("course", { course: data });
          }
        })
        .catch((err) => {
          res.render("course", { message: err.message });
        });
    });

  app.get("/courses", function(req, res) {
      collegeData.getCourses()
        .then(function(data) {
          res.render("courses", { courses: data });
        })
        .catch(function(err) {
          res.render("courses", { message: "no results" });
        });
    });

    app.get("/courses/add", function(req, res) {
      res.render("addCourse");
    });
  
  app.post('/courses/add', (req, res) => {
    const courseData = req.body;
  
    // Call addCourse function from collegeData module
    collegeData.addCourse(courseData)
      .then(() => {
        res.redirect('/courses');
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('An error occurred while adding the course.');
      });
  });

  app.post("/course/update", (req, res) => {
    const updatedCourse = {
      courseId: parseInt(req.body.courseId),
      courseCode: req.body.courseCode,
      courseName: req.body.courseName,
      // Add other course properties here
    };
  
    collegeData
      .updateCourse(updatedCourse)
      .then(() => {
        res.redirect("/courses");
      })
      .catch((err) => {
        console.error("Error updating course:", err.message);
        res.redirect("/courses");
      });
  });
  
  app.get("/course/delete/:id", (req, res) => {
    const courseId = parseInt(req.params.id);
    collegeData.deleteCourseById(courseId)
      .then(() => {
        res.redirect("/courses");
      })
      .catch(() => {
        res.status(500).send("Unable to Remove Course / Course not found");
      });
  });

  app.get("/student/delete/:studentNum", (req, res) => {
    const studentNum = req.params.studentNum;
  
    collegeData
      .deleteStudentByNum(studentNum)
      .then(() => {
        res.redirect("/students");
      })
      .catch(() => {
        res.status(500).send("Unable to Remove Student / Student not found");
      });
  });

  app.get('/student/:num', (req, res) => {
    const { num } = req.params;
    let studentData = {};
  
    collegeData
      .getStudentByNum(num)
      .then((student) => {
        if (student) {
          studentData.student = student;
        } else {
          studentData.student = null;
        }
      })
      .catch(() => {
        studentData.student = null;
      })
      .then(collegeData.getCourses)
      .then((courses) => {
        studentData.courses = courses;
  
        // Loop through courses and set "selected" property for the matching course
        if (studentData.student) {
          for (const course of studentData.courses) {
            if (course.courseId === studentData.student.course) {
              course.selected = true;
              break;
            }
          }
        }
      })
      .catch(() => {
        studentData.courses = [];
      })
      .then(() => {
        if (!studentData.student) {
          res.status(404).send("Student Not Found");
        } else {
          studentData.selectedCourse = studentData.student.course
          res.render("student", studentData);
        }
      });
  });
  

  app.post("/student/update", (req, res) => {
    const updatedStudent = {
        studentNum: parseInt(req.body.studentNum),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        addressStreet: req.body.addressStreet,
        addressCity: req.body.addressCity,
        addressProvince: req.body.addressProvince,
        TA: req.body.TA === "on", // Convert checkbox value to boolean
        status: req.body.status,
        course: req.body.course,
    };

    collegeData
        .updateStudent(updatedStudent)
        .then(() => {
            res.redirect("/students");
        })
        .catch((err) => {
            console.error("Error updating student:", err.message);
            res.redirect("/students");
        });
});


    app.get('/', (req, res) => {
      res.render("home")
    });

    app.get('/about', (req, res) => {
      res.render("about")
    });

    app.get('/htmlDemo', (req, res) => {
      res.render("htmlDemo")
    });

    app.get('/students/add', (req, res) => {
      collegeData.getCourses()
        .then((courses) => {
          log("270>>>", courses)
          res.render("addStudent", { courses: courses });
        })
        .catch(() => {
          res.render("addStudent", { courses: [] });
        });
    });

    app.post('/students/add', (req, res) => {
      const studentData = req.body;
    
      // Call addStudent function from collegeData module
      collegeData.addStudent(studentData)
        .then(() => {
          res.redirect('/students');
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('An error occurred while adding the student.');
        });
    });
    
    

    // 404 route
    app.use((req, res) => {
      res.status(404).send('Page Not Found');
    });

    // Start the server
    app.listen(HTTP_PORT, () => {
      console.log('Server listening on port:', HTTP_PORT);
    });
  })
  .catch((err) => {
    console.error(err);
  });
