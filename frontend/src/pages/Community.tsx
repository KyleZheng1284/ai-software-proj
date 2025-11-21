import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { communityService } from '../services/api';

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'challenges'>('posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [commentingOnPost, setCommentingOnPost] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [postFormData, setPostFormData] = useState({
    title: '',
    content: '',
    post_type: 'tip',
  });
  const [challengeFormData, setChallengeFormData] = useState({
    title: '',
    description: '',
    challenge_type: 'steps',
    target_value: '',
    unit: 'steps',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'posts') {
      loadPosts();
    } else {
      loadChallenges();
    }
  }, [activeTab]);

  const loadPosts = async () => {
    try {
      const response = await communityService.getPosts();
      setPosts(response.posts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChallenges = async () => {
    try {
      const response = await communityService.getChallenges(true);
      setChallenges(response.challenges);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communityService.createPost(postFormData);
      setShowPostModal(false);
      setPostFormData({
        title: '',
        content: '',
        post_type: 'tip',
      });
      loadPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communityService.createChallenge(challengeFormData);
      setShowChallengeModal(false);
      setChallengeFormData({
        title: '',
        description: '',
        challenge_type: 'steps',
        target_value: '',
        unit: 'steps',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
      });
      loadChallenges();
    } catch (error) {
      console.error('Failed to create challenge:', error);
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      await communityService.likePost(postId);
      loadPosts();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleJoinChallenge = async (challengeId: number) => {
    try {
      await communityService.joinChallenge(challengeId);
      loadChallenges();
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  const handleCommentClick = (postId: number) => {
    setCommentingOnPost(commentingOnPost === postId ? null : postId);
    setCommentText('');
  };

  const handleSubmitComment = async (postId: number) => {
    if (!commentText.trim()) return;
    
    try {
      await communityService.commentOnPost(postId, commentText);
      setCommentText('');
      setCommentingOnPost(null);
      loadPosts();
    } catch (error) {
      console.error('Failed to comment on post:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          {activeTab === 'posts' ? (
            <button onClick={() => setShowPostModal(true)} className="btn-primary">
              + Create Post
            </button>
          ) : (
            <button onClick={() => setShowChallengeModal(true)} className="btn-primary">
              + Create Challenge
            </button>
          )}
        </div>

        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'posts'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'challenges'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Challenges
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : activeTab === 'posts' ? (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold">{post.username || 'Anonymous'}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                      {post.post_type}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                    >
                      <span>❤️</span>
                      <span>{post.likes_count}</span>
                    </button>
                    <button
                      onClick={() => handleCommentClick(post.id)}
                      className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                    >
                      <span>💬</span>
                      <span>{post.comments_count}</span>
                    </button>
                  </div>
                  
                  {/* Display existing comments */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <p className="text-sm font-semibold text-gray-700">Comments:</p>
                      {post.comments.map((comment: any) => (
                        <div key={comment.id} className="flex space-x-3 bg-gray-50 rounded-lg p-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {comment.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-sm text-gray-900">{comment.username}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Comment input box */}
                  {commentingOnPost === post.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="input-field flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSubmitComment(post.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleSubmitComment(post.id)}
                          className="btn-primary"
                          disabled={!commentText.trim()}
                        >
                          Post
                        </button>
                        <button
                          onClick={() => setCommentingOnPost(null)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-500 mb-4">No posts yet</p>
                <button onClick={() => setShowPostModal(true)} className="btn-primary">
                  Create First Post
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.length > 0 ? (
              challenges.map((challenge) => (
                <div key={challenge.id} className="card hover:shadow-lg transition-shadow">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium capitalize">
                      {challenge.challenge_type}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{challenge.title}</h3>
                  <p className="text-gray-700 mb-4">{challenge.description}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-medium">{challenge.target_value} {challenge.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participants:</span>
                      <span className="font-medium">{challenge.participants_count}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinChallenge(challenge.id)}
                    className="w-full btn-primary"
                  >
                    Join Challenge
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-2 card text-center py-12">
                <p className="text-gray-500 mb-4">No active challenges</p>
                <button onClick={() => setShowChallengeModal(true)} className="btn-primary">
                  Create First Challenge
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create Post</h2>
              <button onClick={() => setShowPostModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="label">Post Type</label>
                <select
                  value={postFormData.post_type}
                  onChange={(e) => setPostFormData({ ...postFormData, post_type: e.target.value })}
                  className="input-field"
                >
                  <option value="tip">Tip</option>
                  <option value="question">Question</option>
                  <option value="success">Success Story</option>
                  <option value="motivation">Motivation</option>
                </select>
              </div>
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={postFormData.title}
                  onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Content</label>
                <textarea
                  value={postFormData.content}
                  onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                  className="input-field min-h-[120px]"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 btn-primary">
                  Create Post
                </button>
                <button type="button" onClick={() => setShowPostModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChallengeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create Challenge</h2>
              <button onClick={() => setShowChallengeModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="label">Challenge Type</label>
                <select
                  value={challengeFormData.challenge_type}
                  onChange={(e) => setChallengeFormData({ ...challengeFormData, challenge_type: e.target.value })}
                  className="input-field"
                >
                  <option value="steps">Steps</option>
                  <option value="distance">Distance</option>
                  <option value="workouts">Workouts</option>
                  <option value="calories">Calories</option>
                </select>
              </div>
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={challengeFormData.title}
                  onChange={(e) => setChallengeFormData({ ...challengeFormData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={challengeFormData.description}
                  onChange={(e) => setChallengeFormData({ ...challengeFormData, description: e.target.value })}
                  className="input-field min-h-[80px]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Target Value</label>
                  <input
                    type="number"
                    value={challengeFormData.target_value}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, target_value: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <input
                    type="text"
                    value={challengeFormData.unit}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, unit: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    value={challengeFormData.start_date}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, start_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    value={challengeFormData.end_date}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, end_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 btn-primary">
                  Create Challenge
                </button>
                <button type="button" onClick={() => setShowChallengeModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Community;



