"""Testo 3D estruso nei colori Correre Naturale, sequenza PNG con alpha (scala in entrata + rotazione lenta).
Uso: blender -b -P scripts/blender_text3d.py -- "PAROLA" out/dir [frames] [solo_ultimo]
"""
import bpy, sys, math, os
argv = sys.argv[sys.argv.index("--") + 1:]
text, outdir = argv[0], argv[1]
nframes = int(argv[2]) if len(argv) > 2 else 48
only_last = len(argv) > 3
os.makedirs(outdir, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"; sc.cycles.samples = 48; sc.cycles.device = "CPU"
sc.cycles.use_denoising = False; bpy.context.view_layer.cycles.use_denoising = False
sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
sc.render.resolution_x, sc.render.resolution_y = 1080, 420
sc.render.film_transparent = True
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"
sc.frame_start, sc.frame_end = (nframes, nframes) if only_last else (1, nframes)

bpy.ops.object.text_add(); t = bpy.context.object
t.data.body = text; t.data.extrude = 0.12; t.data.bevel_depth = 0.012; t.data.align_x = "CENTER"; t.data.align_y = "CENTER"
for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]:
    if os.path.exists(f): t.data.font = bpy.data.fonts.load(f)
t.rotation_euler = (math.radians(90), 0, 0)

def mat(name, rgb, emit):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = 0.4
    b.inputs["Emission Color"].default_value = (*rgb, 1); b.inputs["Emission Strength"].default_value = emit
    return m
t.data.materials.append(mat("lime", (0.584, 1.0, 0.0), 0.3))
t.data.materials.append(mat("green", (0.287, 0.463, 0.18), 0.08))

bpy.ops.object.light_add(type="AREA", location=(2, -4, 4)); L = bpy.context.object; L.data.energy = 400; L.data.size = 5
bpy.ops.object.light_add(type="AREA", location=(-3, -3, 1)); L2 = bpy.context.object; L2.data.energy = 200; L2.data.size = 4
bpy.ops.object.camera_add(location=(0, -8, 0), rotation=(math.radians(90), 0, 0)); cam = bpy.context.object
cam.data.type = "ORTHO"; sc.camera = cam

dg = bpy.context.evaluated_depsgraph_get(); dg.update()
bb = t.evaluated_get(dg).bound_box
w = max(v[0] for v in bb) - min(v[0] for v in bb)
h = max(v[2] for v in bb) - min(v[2] for v in bb)
cam.data.ortho_scale = max(w * 1.15, (h * 1.3) * 1080 / 420, 2.0)
print("TEXT WIDTH", w, "HEIGHT", h, "ORTHO", cam.data.ortho_scale)

t.scale = (0.2, 0.2, 0.2); t.keyframe_insert("scale", frame=1)
t.scale = (1, 1, 1); t.keyframe_insert("scale", frame=12)
t.rotation_euler = (math.radians(90), 0, math.radians(-18)); t.keyframe_insert("rotation_euler", frame=1)
t.rotation_euler = (math.radians(90), 0, math.radians(18)); t.keyframe_insert("rotation_euler", frame=nframes)
for fc in t.animation_data.action.fcurves:
    for kp in fc.keyframe_points: kp.interpolation = "BEZIER"
sc.render.filepath = os.path.join(outdir, "f_")
bpy.ops.render.render(animation=True)
print("DONE", text, outdir)
