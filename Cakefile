fs = require 'fs'
path = require 'path'
{exec} = require 'child_process'

base = path.basename
report = (err) -> puts err if err

builder = (dir, fn) ->
  fs.readdir "src/#{dir}/", (err, files) ->
    report err
    fn file for file in files

watcher = (dir, fn) ->
  fs.readdir "src/#{dir}/", (err, files) ->
    report err
    for file in files
      fs.watchFile "src/#{dir}/#{file}", (curr, prev) ->
        fn file unless curr.mtime.toString() is prev.mtime.toString()

jade = (file) ->
  lib = "#{base file, '.jade'}.html"
  exec "jade src/pages/#{file} -p > lib/#{lib}", execer file, lib

sass = (file) ->
  lib = "#{base file, '.sass'}.css"
  exec "sass src/styles/#{file}:lib/css/#{lib}", execer file, lib

coffee = (file) ->
  lib = "#{base file, '.coffee'}.js"
  exec "coffee -p src/scripts/#{file} > lib/js/#{lib}", execer file, lib

execer = (file, lib) -> (err) ->
  report err
  puts "Wrote #{file} to #{lib}." unless err

task 'build', 'Builds the source code into the lib directory.', ->
  builder 'pages', jade
  builder 'styles', sass
  builder 'scripts', coffee

task 'watch', 'Watches for changes on all files and builds when appropriate.', ->
  watcher 'pages', jade
  watcher 'styles', sass
  watcher 'scripts', coffee
