"""Esempio render Blender headless (3D title). Uso:
   blender -b -P scripts/blender_render.py -- "TESTO" out/title.png
"""
import bpy, sys
args = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else ["TITLE", "out/blender_title.png"]
text, out = args[0], args[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.object.text_add(); t = bpy.context.object; t.data.body = text; t.data.extrude = 0.08; t.data.align_x = "CENTER"
bpy.ops.object.light_add(type="SUN", location=(2, -2, 5))
bpy.ops.object.camera_add(location=(0, -6, 2), rotation=(1.25, 0, 0)); bpy.context.scene.camera = bpy.context.object
sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.samples = 32; sc.cycles.device = "CPU"; sc.cycles.use_denoising = False; bpy.context.view_layer.cycles.use_denoising = False; sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
sc.render.film_transparent = True; sc.render.filepath = out
bpy.ops.render.render(write_still=True)
