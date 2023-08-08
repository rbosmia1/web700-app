const Sequelize = require('sequelize');
const sequelize = new Sequelize('pkpyzipi', 'pkpyzipi', 'bJeWGbf_e7fHU7hAgCKup_hPJaUBAAhe', {
  host: 'batyr.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});


class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

let dataCollection = null;

// Define the Student model
const Student = sequelize.define('student', {
  studentNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  addressStreet: {
    type: Sequelize.STRING,
    allowNull: false
  },
  addressCity: {
    type: Sequelize.STRING,
    allowNull: false
  },
  addressProvince: {
    type: Sequelize.STRING,
    allowNull: false
  },
  TA: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

// Define the Course model
const Course = sequelize.define('course', {
  courseId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseCode: {
    type: Sequelize.STRING,
    allowNull: false
  },
  courseDescription: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

// Define the relationship between Course and Student (hasMany)
Course.hasMany(Student, { foreignKey: 'course' });

// Sync the models with the database
/*(async () => {
  await sequelize.sync({ force: true });
  console.log('Models synchronized successfully.');
})().catch((error) => {
  console.error('Error synchronizing models:', error);
});
*/


function initialize() {
  return sequelize.sync()
    .then(() => {
      console.log('Database synchronized successfully.');
    })
    .catch((error) => {
      throw new Error('Unable to sync the database');
    });
}


function getAllStudents() {
  return Student.findAll()
    .then((students) => {
      if (students.length === 0) {
        throw new Error('No results returned');
      }
      return students;
    })
    .catch((error) => {
      throw new Error('No results returned');
    });
}

function getCourses() {
  return Course.findAll()
    .then((courses) => {
      if (courses.length === 0) {
        throw new Error('No results returned');
      }
      return courses;
    })
    .catch((error) => {
      throw new Error('No results returned');
    });
}

function getStudentsByCourse(course) {
  return Student.findAll({ where: { course: course } })
    .then((students) => {
      if (students.length === 0) {
        throw new Error('No results returned');
      }
      return students;
    })
    .catch((error) => {
      throw new Error('No results returned');
    });
}

function getStudentByNum(num) {
  return Student.findOne({ where: { studentNum: parseInt(num) } })
    .then((student) => {
      if (!student) {
        throw new Error('No results returned');
      }
      return student;
    })
    .catch((error) => {
      throw new Error('No results returned');
    });
}


function getTAs() {
  return Student.findAll({ where: { TA: true } })
    .then((student) => {
      if (!student) {
        throw new Error('No results returned');
      }
      return student;
    })
    .catch((error) => {
      throw new Error('No results returned');
    });
}

function deleteStudentByNum(studentNum) {
  return Student.destroy({
    where: {
      studentNum: studentNum,
    },
  });
}

function addStudent(studentData) {
  studentData.TA = studentData.TA === 'on' ? true : false;
  for (const key in studentData) {
    if (studentData[key] === '') {
      studentData[key] = null;
    }
  }

  return Student.create(studentData)
    .then(() => {
      console.log('Student created successfully.');
    })
    .catch((error) => {
      throw new Error('Unable to create student');
    });
}


function getCourseById(id) {
  return Course.findOne({ where: { courseId: id } })
    .then((course) => {
      if (!course) {
        throw new Error('No results returned');
      }
      return course;
    })
    .catch((error) => {
      throw new Error('No results returned');
    });
}


function updateStudent(studentData) {
  studentData.TA = studentData.TA === 'on' ? true : false;
  for (const key in studentData) {
    if (studentData[key] === '') {
      studentData[key] = null;
    }
  }

  return Student.update(studentData, { where: { studentNum: studentData.studentNum } })
    .then(() => {
      console.log('Student updated successfully.');
    })
    .catch((error) => {
      throw new Error('Unable to update student');
    });
}

function addCourse(courseData) {
  // Replace any blank values with null
  for (const key in courseData) {
    if (courseData[key] === "") {
      courseData[key] = null;
    }
  }

  // Call Course.create() to add the new course
  return new Promise((resolve, reject) => {
    Course.create(courseData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create course");
      });
  });
}

function updateCourse(courseData) {
  // Replace any blank values with null
  for (const key in courseData) {
    if (courseData[key] === "") {
      courseData[key] = null;
    }
  }

  // Call Course.update() to update the course
  return new Promise((resolve, reject) => {
    Course.update(courseData, {
      where: {
        courseId: courseData.courseId,
      },
    })
      .then(([rowsUpdated]) => {
        if (rowsUpdated === 1) {
          resolve();
        } else {
          reject("unable to update course");
        }
      })
      .catch((err) => {
        reject("unable to update course");
      });
  });
}

function deleteCourseById(id) {
  // Call Course.destroy() to delete the course
  return new Promise((resolve, reject) => {
    Course.destroy({
      where: {
        courseId: id,
      },
    })
      .then((rowsDeleted) => {
        if (rowsDeleted === 1) {
          resolve();
        } else {
          reject("course not found");
        }
      })
      .catch((err) => {
        reject("unable to delete course");
      });
  });
}

module.exports = {
  initialize,
  getAllStudents,
  getTAs,
  getCourses,
  getStudentsByCourse,
  getStudentByNum,
  addStudent,
  getCourseById,
  updateStudent,
  addCourse,
  updateCourse,
  deleteCourseById,
  deleteStudentByNum
};
