
var container,
    orig_src = new Image(),
    image_target=$('.resize-image')[0],
    event_state={},
    constrain=false,
    min_width=60,
    min_height=60,
    max_width=800,
    max_height=900,
    resize_canvas=document.createElement('canvas');

init();

function init () {
    orig_src.onload=function (e) {
        $(image_target).wrap('<div class="resize-container"></div>')
            .before('<span class="resize-handle resize-handle-nw"></span>')
            .before('<span class="resize-handle resize-handle-ne"></span>')
            .before('<span class="resize-handle resize-handle-se"></span>')
            .before('<span class="resize-handle resize-handle-sw"></span>');

        $container = $(image_target).parent('.resize-container');
        $container.on('mousedown','.resize-handle',startResize);
        $container.on('mousedown','img',startMoving);
        $('.js-crop').click(crop);
    };
    orig_src.src=image_target.src;

}

function startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    saveEventState(e);

    $(document).on('mousemove',resizing);
    $(document).on('mouseup',endResize);
}

function endResize(e) {
    e.preventDefault();
    $(document).off('mousemove',resizing);
    $(document).off('mouseup',endResize);
}

function saveEventState(e) {
    event_state.container_width=$container.width();
    event_state.container_height=$container.height();
    event_state.container_left=$container.offset().left;
    event_state.container_top = $container.offset().top;
    event_state.mouse_x=(e.clientX || e.pageX) + $(window).scrollLeft();
    event_state.mouse_y=(e.clientY || e.pageY) + $(window).scrollTop();

    event_state.evnt=e;
}

function resizing(e) {
    var mouse={},width,height,top,left,offset=$container.offset();
    mouse.x=(e.clienX||e.pageX)+$(window).scrollLeft();
    mouse.y=(e.clientY||e.pageY)+$(window).scrollTop();

    // Position image differently depending on the corner dragged and constraints
    if( $(event_state.evnt.target).hasClass('resize-handle-se') ){
        width = mouse.x - event_state.container_left;
        height = mouse.y  - event_state.container_top;
        left = event_state.container_left;
        top = event_state.container_top;
    } else if($(event_state.evnt.target).hasClass('resize-handle-sw') ){
        width = event_state.container_width - (mouse.x - event_state.container_left);
        height = mouse.y  - event_state.container_top;
        left = mouse.x;
        top = event_state.container_top;
    } else if($(event_state.evnt.target).hasClass('resize-handle-nw') ){
        width = event_state.container_width - (mouse.x - event_state.container_left);
        height = event_state.container_height - (mouse.y - event_state.container_top);
        left = mouse.x;
        top = mouse.y;
        if(constrain || e.shiftKey){
            top = mouse.y - ((width / orig_src.width * orig_src.height) - height);
        }
    } else if($(event_state.evnt.target).hasClass('resize-handle-ne') ){
        width = mouse.x - event_state.container_left;
        height = event_state.container_height - (mouse.y - event_state.container_top);
        left = event_state.container_left;
        top = mouse.y;
        if(constrain || e.shiftKey){
            top = mouse.y - ((width / orig_src.width * orig_src.height) - height);
        }
    }

    // Optionally maintain aspect ratio
    if(constrain || e.shiftKey){
        height = width / orig_src.width * orig_src.height;
    }

    if(width > min_width && height > min_height && width < max_width && height < max_height){
        // To improve performance you might limit how often resizeImage() is called
        resizeImage(width, height);
        // Without this Firefox will not re-calculate the the image dimensions until drag end
        $container.offset({'left': left, 'top': top});
    }
}

function resizeImage(width,height) {
    resize_canvas.width=width;
    resize_canvas.height=height;
    resize_canvas.getContext('2d').drawImage(orig_src, 0, 0, width, height);
    $(image_target).attr('src',resize_canvas.toDataURL());
}

function startMoving(e) {
    e.preventDefault();
    e.stopPropagation();
    saveEventState(e);
    $(document).on('mousemove', moving);
    $(document).on('mouseup', endMoving);
}

function endMoving(e) {
    e.preventDefault();
    $(document).off('mousemove', moving);
    $(document).off('mouseup', endMoving);
}

function moving(e) {
    e.preventDefault();
    e.stopPropagation();
    var mouse={};

    mouse.x = (e.clientX || e.pageX) + $(window).scrollLeft();
    mouse.y = (e.clientY || e.pageY ) + $(window).scrollTop();
    $container.offset({
        'left': mouse.x - ( event_state.mouse_x - event_state.container_left ),
        'top': mouse.y - ( event_state.mouse_y - event_state.container_top )
    });
}

function crop(e) {
    var crop_canvas,
        left=$('.overlay').offset().left-$container.offset().left,
        top=$('.overlay').offset().top-$container.offset().top,
        width=$('.overlay').width(),
        height=$('.overlay').height();

    crop_canvas=document.createElement('canvas');
    crop_canvas.width=width;
    crop_canvas.height=height;
    crop_canvas.getContext('2d').drawImage(image_target,left,top,width,height,0,0,width,height);
    window.open(crop_canvas.toDataURL("image/png"));
}