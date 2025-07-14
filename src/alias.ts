import * as moduleAlias from "module-alias";
import * as path from "path";

// Configura os aliases de módulo para o docker em runtime
moduleAlias.addAliases({
  "@controllers": path.join(__dirname, "controllers"),
  "@database": path.join(__dirname, "database"),
  "@entities": path.join(__dirname, "entities"),
  "@repositories": path.join(__dirname, "repositories"),
  "@services": path.join(__dirname, "services"),
  "@types": path.join(__dirname, "types"),
  "@interfaces": path.join(__dirname, "types"),
  "@scripts": path.join(__dirname, "scripts"),
});
