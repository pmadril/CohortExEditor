(function($) {
	var isLoading = false;
	var handleRepoClick = function(){
		Stevenson.ui.Loader.display('Loading branches...', 100);
		var repo = $(this).attr('href');
		Stevenson.repo.getBranches({
			repoName: repo,
			success: function(branches){
				Stevenson.log.debug('Loaded branches: '+branches);
				$('#branches').html('');
				$.each(branches, function(index, branch) {
					$('#branches').append(
							'<option value="' + branch + '">'
									+ branch + '</option>');
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
	};
	var handleFavoriteClick = function(){
		var name = $(this).attr('href');
		if(Stevenson.Account.favoriteRepos.indexOf(name) == -1){
			Stevenson.log.debug('Adding repository ' + name + ' to favorites');
			Stevenson.Account.favoriteRepos.push(name);
			Stevenson.Account.save();
		} else {
			Stevenson.ui.Messages.displayError('Repository ' + name + ' is already a favorite');
			Stevenson.log.warn('Repository ' + name + ' is already a favorite');
		}
		loadRepos();
		return false;
	};
	var loadRepos = function(){
		if(!isLoading){
			isLoading = true;
			Stevenson.ui.Loader.display('Loading repositories...', 100);
			Stevenson.log.info('Initializing editor-home');
			
			$('#your-repos-container').html('');
			$('#favorite-repos-container').html('');
	
			Stevenson.repo.getRepos({
				success: function(repos){
					$.each(repos, function(index, repo) {
						var data = {
							style: (index % 4 == 0) ? "margin-left:0;clear:both" : '',
							name: repo['full_name'],
							description: repo['description']
						};
						$('#your-repos-container').mustache('repo-item', data);
					});
					$.each(Stevenson.Account.favoriteRepos, function(findex, repo){
						Stevenson.repo.getRepo({
							name: repo,
							success: function(repo){
								var data = {
									style: (findex % 4 == 0) ? "margin-left:0;clear:both" : '',
									name: repo['full_name'],
									description: repo['description']
								};
								var item = $('#favorite-repos-container').mustache('repo-item', data);
								$(item).find('a.favorite').html('unfavorite');
								$(item).find('a.favorite').click(function(){
									var name = $(this).attr('href');
									var idx = Stevenson.Account.favoriteRepos.indexOf(name);
									if(idx != -1){
										Stevenson.Account.favoriteRepos.splice(idx, 1);
										Stevenson.Account.save();
									} else {
										Stevenson.log.warn('Repository ' + name + ' is not favorited');
									}
									loadRepos();
									return false;
								});
								$(item).find('a.open').click(handleRepoClick);
							},
							error: function(message){
								Stevenson.ui.Loader.hide();
								Stevenson.ui.Messages.displayError('Unable to load repo: '
										+ message);
							}
						});
					});
					Stevenson.ui.Loader.hide();
					isLoading = false;
					$('#your-repos-container a.open').click(handleRepoClick);
					$('#your-repos-container .favorite').click(handleFavoriteClick);
				}, 
				error: function(message){
					Stevenson.ui.Loader.hide();
					isLoading = false;
					Stevenson.ui.Messages.displayError('Unable to load repos: '
							+ message);
				}
			});
		}
	};
	Stevenson.ext.afterInit(loadRepos);
	$(document).ready(function(){
		$('#branch-modal .btn').click(function(){
			Stevenson.Account.repo = $('#current-repo').html();
			Stevenson.Account.branch = $('#branches').val();
			Stevenson.Account.save();
			Stevenson.repo.getLayouts({
				success: function(branches){
					window.location = 'edit-site.html';
				},
				error: function(err){
					Stevenson.ui.Messages.displayError('Unable to load layouts: '
							+ err);
				}
			});
			
			return false;
		});
		$('#add-repo').submit(function(){
			var user = $('#add-repo input[name=owner]').val();
			var repo = $('#add-repo input[name=repo]').val();
			Stevenson.repo.getRepo({
				name: user+"/"+repo,
				success: function(repo){
					var name = repo['full_name'];
					if(repo != null && name != null){
						if(Stevenson.Account.favoriteRepos.indexOf(name) == -1){
							Stevenson.Account.favoriteRepos.push(name);
							Stevenson.Account.save();
							loadRepos();
							return false;
						} else {
							Stevenson.ui.Messages.displayError('Repository ' +  name + ' is already a favorite');
						}
					} else {
						Stevenson.ui.Messages.displayError('Unable to find repository ' + repo + ' owned by user ' + user);
						Stevenson.log.warn('Repositoty returned for ' + owner + '/' + repo + ' not valid: '+repo);
					}
				},
				error: function(message){
					Stevenson.ui.Loader.hide();
					Stevenson.ui.Messages.displayError('Excepting finding repository: ' + repo + ' owned by user ' + user);
					Stevenson.log.warn('Received exception ' + message + ' when trying to find repository ' + owner + '/' + repo);
				}
			});
			return false;
		});
	});
})(jQuery);