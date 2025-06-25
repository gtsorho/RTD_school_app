import bcrypt from 'bcrypt';
import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';

interface StudentAttributes {
  name: string;
  image?: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone_number?: string;
  address: string;
  guardian: string;
  guardian_phone: string;
  password?: string;
}

interface StudentCreationAttributes extends StudentAttributes {}

interface StudentInstance extends Model<StudentAttributes, StudentCreationAttributes>, StudentAttributes {
  isValidPassword(password: string): Promise<boolean>;
}

type UserModelStatic = typeof Model & {
  new (values?: Record<string, any>, options?: BuildOptions): StudentInstance;
};
 export default (sequelize: Sequelize) => {
  const Student:any= <UserModelStatic> sequelize.define("Student", {
    name: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    date_of_birth: { type: DataTypes.DATE, allowNull: false },
    gender: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    phone_number: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: false },
    guardian: { type: DataTypes.STRING, allowNull: false },
    guardian_phone: { type: DataTypes.STRING, allowNull: false },
    password: {
      type:DataTypes.STRING,
      allowNull:true
    },
  });

  
  Student.beforeCreate(async (student: StudentInstance) => {
    if (student.password) {
      const hash = await bcrypt.hash(student.password, 10);
      student.password = hash;
    }
  });
  
  Student.prototype.isValidPassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  };
  
  return Student;
  
};

 
