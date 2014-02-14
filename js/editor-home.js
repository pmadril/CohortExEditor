(function($) {
	var loadRepos = function(group){
		Stevenson.ui.Loader.display('Loading repositories...', 100);
		Stevenson.log.info('Loading repositories for '+group);
		Stevenson.repo.getRepos({
			group: group,
			success: function(repos){
				var container = $('.tab-content #mine');
				if(group) {
					container = $('.tab-content #'+group);
				}
				$.each(repos, function(index, repo) {
					var data = {
						name: repo['full_name'],
						description: repo['description']
					};
					container.mustache('repo-item', data);
				});
				Stevenson.ui.Loader.hide();
				container.find('a.open').click(function(){
					Stevenson.ui.Loader.display('Loading branches...', 100);
					var repo = $(this).attr('data-repo');
					Stevenson.repo.getBranches({
						repoName: repo,
						success: function(branches){
							Stevenson.log.debug('Loaded branches: '+branches);
							$('#branches').html('');
							$.each(branches, function(index, branch) {
								$('#branches').append('<option value="' + branch + '">'+ branch + '</option>');
							});
							$('#current-repo').html(repo);
							Stevenson.ui.Loader.hide();
							$('#branch-modal').modal('show');
						},
						error: function(err){
							Stevenson.ui.Messages.displayError('Unable to load branches: '
								+ err);
							Stevenson.ui.Loader.hide();
						}
					});
					return false;
				});
			}, 
			error: function(message){
				Stevenson.ui.Loader.hide();
				isLoading = false;
				Stevenson.ui.Messages.displayError('Unable to load repositories: '
						+ message);
			}
		});
	};
	Stevenson.ext.afterInit(function(){
		Stevenson.ui.Loader.display('Loading organizations...', 100);
		Stevenson.repo.getOrgs({
			success: function(orgs){
				$.each(orgs,function(idx, org){
					$('.nav-tabs').append('<li><a href="#' + org.login + '">' + org.login + '</a></li>');
					$('.nav-tabs a[href=#'+org.login+']').click(function(){
						if($('.tab-pane#'+org.login).html() == ''){
							$('#'+org.login).append('<h4>'+org.login+'</h4>');
							loadRepos(org.login);
						}
  						$(this).tab('show');
  						return false;
  					});
					$('.repos').append('<div class="tab-pane" id="' + org.login + '"></div>');
				});
				Stevenson.ui.Loader.hide();
				loadRepos();
				$('.nav-tabs a[href=#mine]').click(function(){
  					$(this).tab('show');
  					return false;
  				});
			}, 
			error: function(message){
				Stevenson.ui.Loader.hide();
				Stevenson.ui.Messages.displayError('Unable to load groups: '
						+ message);
			}
		});
	});
	$(document).ready(function(){
		$('#branch-modal .btn').click(function(){
			Stevenson.Account.repo = $('#current-repo').html();
			Stevenson.Account.branch = $('#branches').val();
			Stevenson.Account.save();
			Stevenson.repo.getLayouts({
				success: function(branches){
					window.location = '/cms/site.html';
				},
				error: function(err){
					Stevenson.ui.Messages.displayError('Unable to load layouts: '
							+ err);
				}
			});
			
			return false;
		});
		
	});
})(jQuery);