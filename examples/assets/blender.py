# Generates blender.obj from the default scene:
# blender --factory-startup -b --python blender.py -- blender.obj
import sys
import bpy

out = sys.argv[sys.argv.index("--") + 1]

# Default scene cube keeps its "Material"
bpy.ops.mesh.primitive_monkey_add(location=(3, 0, 0))
suzanne = bpy.context.active_object
bpy.ops.object.shade_smooth()
mat = bpy.data.materials.new("Suzanne")
suzanne.data.materials.append(mat)
colors = suzanne.data.color_attributes.new("Col", "FLOAT_COLOR", "POINT")
for i, v in enumerate(suzanne.data.vertices):
    colors.data[i].color = (abs(v.co.x), abs(v.co.y), abs(v.co.z), 1)

bpy.ops.mesh.primitive_plane_add(size=8, location=(1.5, 0, -1.5))

bpy.ops.wm.obj_export(filepath=out, export_colors=True)
