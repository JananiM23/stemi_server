var Canvas = require("canvas");
var assert = require("assert").strict;
var fs = require("fs");
var pdfjsLib = require("pdfjs-dist/es5/build/pdf.js");
var CMAP_URL = "../../node_modules/pdfjs-dist/cmaps";
var CMAP_PACKED = true;


function NodeCanvasFactory() {}
NodeCanvasFactory.prototype = {
   create: function NodeCanvasFactory_create(width, height) {
      assert(width > 0 && height > 0, "Invalid canvas size");
      var canvas = Canvas.createCanvas(width, height);
      var context = canvas.getContext("2d");
      return {
         canvas: canvas,
         context: context,
      };
   },
   reset: function NodeCanvasFactory_reset(canvasAndContext, width, height) {
      assert(canvasAndContext.canvas, "Canvas is not specified");
      assert(width > 0 && height > 0, "Invalid canvas size");
      canvasAndContext.canvas.width = width;
      canvasAndContext.canvas.height = height;
   },
   destroy: function NodeCanvasFactory_destroy(canvasAndContext) {
      assert(canvasAndContext.canvas, "Canvas is not specified");
      canvasAndContext.canvas.width = 0;
      canvasAndContext.canvas.height = 0;
      canvasAndContext.canvas = null;
      canvasAndContext.context = null;
   },
};

exports.pdf2base64 = function(pdfPath) {
   return new Promise((resolve, reject) => {
      var data = new Uint8Array(fs.readFileSync(pdfPath));
      var loadingTask = pdfjsLib.getDocument({
         data: data,
         cMapUrl: CMAP_URL,
         cMapPacked: CMAP_PACKED,
      });
      loadingTask.promise.then(function (pdfDocument) {
         pdfDocument.getPage(1).then(function (page) {
            var viewport = page.getViewport({ scale: 1.5 });
            var canvasFactory = new NodeCanvasFactory();
            var canvasAndContext = canvasFactory.create(
               viewport.width,
               viewport.height
            );
            var renderContext = {
               canvasContext: canvasAndContext.context,
               viewport: viewport,
               canvasFactory: canvasFactory,
            };
            var renderTask = page.render(renderContext);
            renderTask.promise.then(function () {
               var image = canvasAndContext.canvas.toBuffer();
               var base64Image = Buffer.from(image, 'binary').toString('base64');
               resolve(base64Image);
            }).catch(error => {
               reject(error);
            });
         });
      }).catch(function (reason) {
         reject(reason);
      });
   });
};
