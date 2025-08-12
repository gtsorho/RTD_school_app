import bcrypt from 'bcrypt';
import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';

interface UserAttributes {
  name: string;
  email: string;
  password: string;
  role:string;
  oid:string;
  image?: string;
}

interface UserCreationAttributes extends UserAttributes {}

interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  isValidPassword(password: string): Promise<boolean>;
}

type UserModelStatic = typeof Model & {
  new (values?: Record<string, any>, options?: BuildOptions): UserInstance;
};

export default (sequelize: Sequelize) => {
  const User :any= <UserModelStatic>sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    oid:{ type: DataTypes.STRING, allowNull: true },
    image : { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    role: {
      type: DataTypes.ENUM('admin', 'user'), 
      defaultValue: 'user',
    },
    password: {
      type:DataTypes.STRING,
      allowNull:true
    },
  });

User.beforeCreate(async (user: UserInstance) => {
  if (user.password) {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
  }
});

User.prototype.isValidPassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

return User;
};
