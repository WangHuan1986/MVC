$(function(){
	
	var Todo = Backbone.Model.extend({
		defaults : {
			done : false,
			title : ''
		},
		toggle : function(){
			this.save({done : !this.get('done')});
		}
	});
	
	var TodoList = Backbone.Collection.extend({
		
		model : Todo,
		
		localStorage : new Backbone.LocalStorage('todos'),
		
		initialize : function(){
		
		},
		
		doneList : function(){
			var list = this.filter(function(mod){
				return mod.get('done');
			});
			
			return list;
		},
		
		undoneList : function(){
			return this.without.apply(this,this.doneList());
		}
		
	});
	
	var todoList = new TodoList();
	
	var ItemView  = Backbone.View.extend({
		
		tagName : 'li',
		
		events : {
			'click .toggle' : 'toggle',
			'click .destroy': 'destroy',
			'dblclick' : 'edit',
			'blur .edit' : 'close'
		},
		
		itemTemplate : _.template($('#item-template').html()),
		
		initialize : function(){
			//_.bindAll(this,'render');
			//��ͼ��ģ�͵İ󶨣�ʹ��listenTo�����������Ҫֱ����model.on����ȥ����
			//��Ϊ�������廯���ã�����render�е���������model����������ͼ
			//��������ͼ�ĳ�ʼ�������������ģ�͵ĸı�
			this.listenTo(this.model,'change',this.render);
			this.listenTo(this.model, 'destroy', this.remove);
		},
		
		toggle : function(e){
			this.model.toggle();
		},	
		
		destroy : function(e){
			this.model.destroy();
		},
		
		edit : function(e){

			var item = this.$el,
				view = item.find('.view'),
				edit = item.find('.edit');
			view.hide();
			edit.show();
			this.$el.find('.edit').focus();
		},
		
		close : function(e){
			
			var item = this.$el,
				view = item.find('.view'),
				edit = item.find('.edit');
			this.model.save({title : edit.val()});
			view.show();
			edit.hide();
		},
		
		render : function(){
			var el = this.$el,
				mod = this.model;
			el.html(this.itemTemplate(mod.toJSON()));
			if(mod.get('done')){
				el.addClass('done');
			}
			else{
				el.removeClass('done');
			}
			
			return this;
		
		}
		
	});
	
	var AppView = Backbone.View.extend({
		
		el : $('#todoapp'),
		
		statusTemplate : _.template($('#stats-template').html()),
		
		events : {
			'keypress #new-todo' : 'onenterpress',
			'click #toggle-all' : 'finishAll',
			'click #clear-completed' : 'clearFinished'
		},
		
		initialize : function(){
			//������fetch��ʱ��������µ�Model���룬��ᴥ��add�¼�
			this.listenTo(todoList, 'add', this.createItem);
			this.listenTo(todoList, 'all', this.render);
			this.main = $('#main');
			this.footer = $('footer');
			this.checkall = $('#toggle-all');
			todoList.fetch();
		},
		
		onenterpress : function(e){
			if(e.keyCode == 13){
				var input = $('#new-todo');
				todoList.create({title : input.val()});
				input.val('');
			}
		},
		
		clearFinished : function(){
			//����ģ�͵�destroy������ע��������Ǵ���������¼�������ֱ�ӵ��÷���
			//model��destroy�����destroy�¼�������¼���ð�ݵ��������ļ���
			//���������model���ϲ�����model��destroy������destroy�¼�������todoView�еļ������ͻ�ִ�У�������ͼ��ص�dom�ͱ�ɾ����
			_.invoke(todoList.doneList(), 'destroy');
			return false;
		},
		
		finishAll : function(){
			var that = this;
			var done = !!that.checkall.attr('checked');
			todoList.each(function(mod){
				mod.save({done : done});
			});
		},
		
		createItem : function(todo){
			//������ͼ��ģ�͵Ĺ�������������ͼ
			//�ڸ���ͼ�лᴴ������ͼ��ʵ������������֮��Ӧ�Ĺ�����Ȼ���ֶ���������ͼ����Ⱦ����
			var itemView = new ItemView({model : todo});
			$('#todo-list').append(itemView.render().$el);
		},
		
		render : function(a,b,c){
			//���е�ģ���Ϸ������¼�����ð�ݵ������ϣ������߼�ֻ���ڷ����⼸���¼���ʱ������ã�����ֻ��ע�⼸���¼�
			if(a == 'add' ||  a == 'destroy' || a == 'change'){
				var remaining = todoList.undoneList().length;
				if(todoList.length > 0){
					this.footer.html(this.statusTemplate({done : todoList.doneList().length , remaining : remaining}));
					this.footer.show();
					this.main.show();
				}
				else{
					this.footer.hide();
					this.main.hide();
				}
				
				this.checkall[0].checked = !remaining;
			}
		}
		
	});
	
	new AppView();
	
});