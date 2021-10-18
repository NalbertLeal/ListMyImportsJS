const fs = require("fs")

const getDirContent = dir => {
  const dirs = fs.readdirSync(dir, { withFileTypes: true })

  const folders = []
  const files = []

  dirs.forEach(path => {
    if (path.isDirectory()) folders.push(path)
    else files.push(path)
  });

  return [folders, files]
}

const endsWithExtension = (path, extensions) => {
  for(const ext of extensions) {
    const pathName = path.name
    if (pathName.endsWith(ext))
      return true 
  }
  return false
}

const getAllFiles = (dirPath, extensions) => {
  let folders = [dirPath]
  let files = []

  for(let i = 0; i < folders.length; i++) {
    const folder = folders[i]
    const [subfolders, subfiles] = getDirContent(folder)
    subfolders.forEach(subfolder => {
      const globalFilePath = folder + "/" + subfolder.name
      folders.push(globalFilePath)
    })
    subfiles
      .filter(filePath => endsWithExtension(filePath, extensions))
      .forEach(subfile => {
        const globalFilePath = folder + "/" + subfile.name
        files.push(globalFilePath)
      })
  }

  return files
}

const getFileImports = filePath => {
  const content = fs.readFileSync(filePath, "utf8")
  const esImportsRegex = /import .+from .+[;|\n]/g
  const allMatchs = [...content.matchAll(esImportsRegex)]
  return allMatchs
}

// EXECUTION

const currentExecutionPath = process.cwd()
const files = getAllFiles(currentExecutionPath, [".js", ".vue"])
const jsImportsMatchs = files.map(file => getFileImports(file))
const matchs = jsImportsMatchs
  .flat()
  .filter(match => !!match && match.length > 0 && !!match[0])
  .map(match => match[0])

const uniqueImports = [...new Set(matchs)]

const libs = []
const libRegExp = /from ("|')([a-zA-Z\_0-9]+)("|')/g
uniqueImports.map(libImport => {
  const result = [...libImport.matchAll(libRegExp)]
  if (result.length == 0 && result.length < 4) return
  const flatResult = result.flat()
  libs.push(flatResult[2])
})

const libsStr = libs.join("\n")
fs.writeFileSync(__dirname + "/" + "result.txt", libsStr)