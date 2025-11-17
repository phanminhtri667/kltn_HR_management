"use strict";

import fs from "fs";
import path from "path";
import SequelizePkg from "sequelize";

const { Sequelize, DataTypes } = SequelizePkg as any;

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

// ✅ Không fix đuôi .ts: chạy được ở cả ts-node (dev) và dist .js (prod)
const configPath = path.join(__dirname, "..", "config", "databaseConfig");
let configModule = require(configPath);
configModule = configModule.default ?? configModule;
const config = configModule[env];

const db: any = {};

let sequelize: any;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// ✅ Hỗ trợ .ts & .js, bỏ qua .d.ts
const validExts = new Set([".ts", ".js"]);
fs.readdirSync(__dirname)
  .filter((file: string) => {
    const ext = path.extname(file);
    return (
      file.indexOf(".") !== 0 && // bỏ file ẩn
      file !== basename &&       // bỏ chính index.ts
      validExts.has(ext) &&
      !file.endsWith(".d.ts")    // bỏ khai báo type
    );
  })
  .forEach((file: string) => {
    const fullPath = path.join(__dirname, file);
    let mod = require(fullPath);
    const factory = mod.default ?? mod; // hỗ trợ default export & module.exports
    if (typeof factory !== "function") return;

    // Một số model định nghĩa (sequelize) hoặc (sequelize, DataTypes)
    const model = factory(sequelize, DataTypes);
    db[model.name] = model;
  });

// Gọi associate sau khi load hết models
Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === "function") {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
