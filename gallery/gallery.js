var Photo = Backbone.Model.extend({
	subalbum : function(){
		return gallery._currentsub;
	}
});

var PhotoList = Backbone.Collection.extend({
	model : Photo
});

var IndexView = Backbone.View.extend({
	
	el : $('#main'),
	
	indexTemplate: $("#indexTmpl").template(),
	
	render : function(){
		var el = this.$el;
		el.empty();
		$.tmpl(this.indexTemplate, this.model.toArray()).appendTo(el);
		return this;
	}
	
});

var AlbumsView  = Backbone.View.extend({
	
	el : $('#main'),
	
	albumsTemplate :  $("#subindexTmpl").template(),
	
	render : function(){
		var el = this.$el;
		el.empty();
		$.tmpl(this.albumsTemplate,this.model.toArray()).appendTo(el);
		return this;
	}
	
});

var AlbumView  = Backbone.View.extend({
	
	el : $('#main'),
	
	albumTemplate :  $("#itemTmpl").template(),
	
	render : function(){
		var el = this.$el;
		el.empty();
		$.tmpl(this.albumTemplate,this.model).appendTo(el);
		return this;
	}
	
});

var Gallery = Backbone.Router.extend({
	
	_index: null,
    _photos: null,
	_currentsub : null,
	_data : null,
	
	routes : {
		'' : 'index',
		'subalbum/:id' : 'ablums',
		'subalbum/:id/:album' : 'album'
	},
	
	initialize : function(options){
		var that = this;
	
		$.ajax({
			url: 'data/album1.json',
			dataType: 'json',
			data: {},
			success: function(data) {
				that._data = data;
				that._photos = new PhotoList(data);
				that._index = new IndexView({model: that._photos}); 
				Backbone.history.loadUrl();

			}
		});
	},
	
	index : function(){
		if(this._index){
			this._index.render();
		}
	},
	
	ablums : function(id){
		this._currentsub = id;
		var albumDataIndex = parseInt(id.replace('c','')),
			albumData = this._data[albumDataIndex].subalbum;
		var ablumsCollection = new PhotoList(albumData);
		var albumsView = new AlbumsView({model : ablumsCollection});
		albumsView.render();
	},
	
	album : function(ablums,album){
		
		this._currentsub = ablums;
		var albumDataIndex = parseInt(ablums.replace('c','')),
			albumData = this._data[albumDataIndex].subalbum;
		var ablumsCollection = new PhotoList(albumData);
		
		var albumMod = ablumsCollection.at(album)
		var albumView = new AlbumView({model : albumMod});
		albumView.render();
	}
	
});

var gallery = new Gallery();
Backbone.history.start();

$(function(){
	$('#click').bind('click',function(){
		gallery.navigate("subalbum/c0",{trigger : true});
	});

});

