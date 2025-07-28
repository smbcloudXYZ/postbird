const builder = require("electron-builder");

var packageJson = require("./package.json");
var childProcess = require("child_process");
var isWin = process.platform === "win32";

var exec = (cmd) => {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        stdout.stderr = stderr;
        resolve(stdout);
      }
    });
  });
};

process.on("unhandledRejection", (error) => {
  // Will print "unhandledRejection err is not defined"
  console.log("unhandledRejection", error.message);
});

(async () => {
  const commitsCount = (await exec("git rev-list HEAD --count")).trim();
  const commitID = (await exec("git log --pretty=format:'%h' -n 1")).trim();

  const buildVersion = `${commitsCount}`;
  console.log("build-version", buildVersion);

  await builder.build({
    //targets: Platform.MAC.createTarget(),
    config: {
      protocols: {
        name: "Postgres Database",
        schemes: ["postgres", "postgresql"],
        role: "Editor",
      },
      fileAssociations: [
        {
          ext: "sql",
          name: "SQL File",
        },
      ],
      npmRebuild: false, // because we changed dependency paths postgres manually
      icon: isWin
        ? "build_files/icon.ico"
        : __dirname + "/build_files/icon.icns",
      productName: process.platform == "linux" ? "postbird" : "Postbird",
      publish: null,

      mac: {
        category: "public.app-category.developer-tools",
        target: ["dmg", "mas"],
        identity: "Apple Distribution: Seto Elkahfi (NADBSNEZWH)",
        bundleVersion: buildVersion,
        bundleShortVersion: packageJson.version,
        minimumSystemVersion: "10.9.0",
        extendInfo: {
          NSRequiresAquaSystemAppearance: false,
        },
        darkModeSupport: true,
        asar: true,
        extraFiles: ["vendor/darwin"],
        asarUnpack: ["node_modules/libpq"],
        files: ["!vendor"],
      },

      mas: {
        entitlements: "build_files/entitlements.mas.plist",
        appId: "com.postbird.Postbird",
        identity: "Apple Distribution: Seto Elkahfi (NADBSNEZWH)",
        provisioningProfile:
          "/Users/setoelka/Desktop/Splitfire AB/Apple Certificates/Postbird Apple Certificates/Postbird_Mac_AppStore_Connect.provisionprofile",
        hardenedRuntime: true,
        gatekeeperAssess: false,
      },
    },
  });
})();
