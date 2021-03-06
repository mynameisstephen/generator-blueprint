# Require any additional compass plugins here.

<%= dependencies.compass.join('\n') %>

# Set this to the root of your project when deployed:
http_path = "/"

css_dir = "bin/css"
fonts_dir = "static/fonts"
javascripts_dir = "js"
sass_dir = "sass"
images_dir = "static/images"
generated_images_dir = "bin/images/sprites"

sprite_load_path = ["sprites"]

http_stylesheets_path = "/css"
http_generated_images_path = "/images/sprites"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
