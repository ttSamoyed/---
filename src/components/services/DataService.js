// 导入 axios
import axios from 'axios';

const apiClient = axios.create({
  baseURL: "http://124.222.42.111:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// 发送请求前的拦截器
apiClient.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;  // 设置 Authorization 头部
  }
  return config;
});

// 错误处理函数
async function handleRequestError(error) {
  const originalRequest = error.config;
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    localStorage.removeItem('access_token');
    try {
      const res = await Relogin();
      if (res.status === 200) {
        localStorage.setItem('access_token', res.data.access_token);
        localStorage.setItem('refresh_token', res.data.refresh_token);
        return apiClient(originalRequest);
      } else {
        console.log('刷新 Token 失败, 请重新登录');
        localStorage.removeItem('refresh_token');
        // 跳转到登录页
        window.location.href = '/login';
      }
    } catch (error) {
      console.log('刷新 Token 失败:', error);
      localStorage.removeItem('refresh_token');
      // 跳转到登录页
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
}

// 响应拦截器
apiClient.interceptors.response.use(response => {
  return response;
}, error => {
  return handleRequestError(error);
});


// 定义一个用于获取数据的函数
export default {
  /**
   * 登录
   * @param {String} username
   * @param {String} password
   * @returns 登录结果和 Token
   * @description 登录成功后, 会将 access_token 和 refresh_token 保存到本地
   */
  Login(username, password) {
    return apiClient.post('/login/', { username, password });
  },

  /**
   * 获取注册验证码
   * @param {String} email
   * @returns 获取验证码结果
   */
  Get_Register_Code(email) {
    return apiClient.post('/register/code/', { email });
  },

  /**
   * 注册
   * @param {String} username
   * @param {String} password
   * @param {String} email
   * @param {String} code
   * @returns 注册结果
   */
  Register(username, password, email) {
    return apiClient.post('/register/', { username, password, email, code });
  },

  /**
   * 重新登录刷新 Token
   * @param {String} refresh_token
   * @returns 登录结果和 Token
   * @description 用于在 access_token 过期时, 通过 refresh_token 来获取新的 access_token. 会将新的 access_token 保存到本地.
   */
  Relogin() {
    const refreshToken = localStorage.getItem('refresh_token');
    return apiClient.post('/relogin/', { refresh_token: refreshToken });
  },

  /**
   * 登出
   * @returns 登出结果
   * @description 登出后, 需要清除本地的 access_token 和 refresh_token
   */
  Logout() {
    return apiClient.post('/logout/');
  },


  //#region 个人账户 ====================

  /**
   * 获取个人详细信息
   * @param {Number} userid
   * @returns 个人详细信息
   */
  Get_Personal_Info(userid) {
    const url = '/profile/' + userid + '/';
    return apiClient.get(url);
  },


  /**
   * 修改个人信息
   * @param {Number} userid
   * @param {String} sex
   * @param {String} status
   * @param {String} stuID
   * @param {String} college
   * @param {String} major
   * @param {String} birth_date
   * @param {String} address
   * @param {String} phone
   * @returns 修改个人信息结果
   */
  Update_Personal_Info(userid, sex, status, stuID, college, major, birth_date, address, phone) {
    const url = '/profile/' + userid + '/';
    return apiClient.patch(url, {
      sex: sex,
      status: status,
      stuID: stuID,
      college: college,
      major: major,
      birth_date: birth_date,
      address: address,
      phone: phone,
    });
  },


  /**
   * 管理员修改个人信息
   * @param {Number} userid
   * @param {String} sex
   * @param {File} avatar
   * @param {String} status
   * @param {String} stuID
   * @param {String} college
   * @param {String} major
   * @param {String} birth_date
   * @param {String} address
   * @param {String} phone
   * @param {Boolean} is_active
   * @param {String} password
   * @returns 管理员修改个人信息结果
   */
  Manage_Personal_Info(userid, sex, avatar, status, stuID, college, major, birth_date, address, phone, is_active, password) {
    const url = '/profile/' + userid + '/';
    return apiClient.post(url, {
      sex: sex,
      avatar: avatar,
      status: status,
      stuID: stuID,
      college: college,
      major: major,
      birth_date: birth_date,
      address: address,
      phone: phone,
      is_active: is_active,
      password: password
    });
  },


  /**
   * 封禁/解封 用户
   * @param {Number} userid
   * @param {Boolean} is_active
   * @returns 封禁/解封 用户结果
   */
  Ban_User(userid, is_active) {
    const url = '/profile/' + userid + '/';
    return apiClient.post(url, { is_active });
  },


  /**
   * 获取所有用户列表及简略信息
   * @param {Number} page - 页码
   * @param {Number} page_size - 每页数量
   * @returns 所有用户列表及简略信息
   */
  Get_All_Users(page = 1, page_size = 10) {
    return apiClient.get('/user/list/', {
      page: page, // 页码
      page_size: page_size // 每页数量
    });
  },

  /**
   * 获取用户头像
   * @param {Number} userid
   * @returns 用户头像 URL
   */
  Get_User_Avatar(userid) {
    const url = 'user/avatar/' + userid + "/";
    return apiClient.get(url);
  },

  /**
   * 修改用户头像
   * @param {Number} userid
   * @param {File} avatar
   * @returns 修改用户头像结果
   */
  Update_User_Avatar(userid, avatar) {
    const url = 'user/avatar/' + userid + "/";
    return apiClient.post(url, { avatar });
  },


  /**
   * 删除用户头像
   * @param {Number} userid
   * @returns 删除用户头像结果
   */
  Delete_User_Avatar(userid) {
    const url = 'user/avatar/' + userid + "/";
    return apiClient.delete(url);
  },

  /**
   * 修改密码
   * @param {string} old_password 
   * @param {string} new_password 
   * @returns 修改密码结果
   */
  Update_Password(old_password, new_password) {
    const url = '/password/change/';
    return apiClient.post(url, { old_password, new_password });
  },

  /**
   * 管理员修改密码
   * @param {Number} userid
   * @param {String} password
   * @returns 管理员修改密码结果
   */
  Manage_Password(userid, password) {
    const url = '/profile/' + userid + '/';
    return apiClient.post(url, { password });
  },

  /**
   * 获取重置密码验证码
   * @returns 获取验证码结果
   */
  Get_Reset_Password_Code() {
    return apiClient.post('/password/reset/code/');
  },

  /**
   * 重置密码
   * @param {string} new_password
   * @param {string} code
   * @returns 重置密码结果
   */
  Reset_Password(new_password, code) {
    return apiClient.post('/password/reset/', { new_password, code });
  },

  /**
   * 删除用户的账户
   * @param {Number} userid 
   * @returns 删除用户的账户结果
   */
  Delete_Account(userid) {
    const url = '/profile/' + userid + '/';
    return apiClient.delete(url);
  },

  //#region 个人账户 ====================


  //#region 博客 ====================


  /**
   * 获取博客列表
   * @param {Number} page - 页码
   * @param {Number} page_size - 每页数量
   * @returns {JSON} - 返回所有博客列表
   */
  Get_All_Blogs(page = 1, page_size = 10) {
    return apiClient.get('/post/list/', {
      page: page, // 页码
      page_size: page_size // 每页数量
    });
  },

  /**
   * 获取热门博客列表
   * @param {Number} page - 页码
   * @param {Number} page_size - 每页数量
   * @returns {JSON} - 返回热门博客列表
   */
  Get_Hot_Blogs(page = 1, page_size = 10) {
    return apiClient.get('/post/hot/list/', {
      page: page, // 页码
      page_size: page_size // 每页数量
    });
  },

  /**
   * 获取精华博客列表
   * @param {Number} page - 页码
   * @param {Number} page_size - 每页数量
   * @returns {JSON} - 返回精华博客列表
   */
  Get_Essence_Blogs(page = 1, page_size = 10) {
    return apiClient.get('/post/essence/list/', {
      page: page, // 页码
      page_size: page_size // 每页数量
    });
  },

  /**
   * 获取我的博客列表
   * @param {Number} page - 页码
   * @param {Number} page_size - 每页数量
   * @returns {JSON} - 返回我的博客列表
   */
  Get_My_Blogs(page = 1, page_size = 10) {
    return apiClient.get('/post/my/list/', {
      page: page, // 页码
      page_size: page_size // 每页数量
    });
  },

  /**
   * 搜索博客
   * @param {string} post_id - 博客ID关键字
   * @param {string} title - 标题关键字
   * @param {string} content - 内容关键字
   * @param {string} author__userID - 作者用户ID关键字
   * @param {string} author__username - 作者用户名关键字
   * @param {string} tags__name - 标签名称关键字
   * @param {string} plate__plateID - 板块ID关键字
   * @param {string} plate__name - 板块名称关键字
   * @param {boolean} is_essence - 是否为精华博客关键字
   * @param {number} page - 页码
   * @param {number} page_size - 每页数量
   * @returns {JSON} - 返回搜索结果
   */
  Search_Blogs(plate__plateID, title, content, author__username, author__userID, tags__name, plate__name, postID, is_essence, page = 1, page_size = 10) {
    return apiClient.post('/post/list/', {
      postID: postID,
      title: title,
      content: content,
      author__userID: author__userID,
      author__username: author__username,
      tags__name: tags__name,
      plate__plateID: plate__plateID,
      plate__name: plate__name,
      is_essence: is_essence,
      page: page,
      page_size: page_size
    });
  },

  /**
   * 获取博客详情
   * @param {Number} blogid - 博客ID
   * @returns {JSON} - 返回博客详情
   */
  Get_Blog_Detail(blogid) {
    const url = '/post/detail/' + blogid + '/';
    return apiClient.get(url);
  },

  /**
   * 获取博客评论
   * @param {Number} blogid - 博客ID
   * @returns {JSON} - 返回博客评论
   */
  Get_Blog_Comments(blogid) {
    const url = '/post/comment/list/' + blogid + '/';
    return apiClient.get(url);
  },

  /**
   * 发表博客
   * @param {String} title - 标题
   * @param {String} content - 内容
   * @param {String} plate - 板块
   * @param {String} tags - 标签
   * @returns {JSON} - 返回发表博客结果
   */
  Publish_Blog(title, content, plate, tags) {
    const url = 'post/create/';
    return apiClient.post(url, { title, content, plate, tags });
  },

  /**
   * 修改博客
   * @param {Number} blogid - 博客ID
   * @param {String} title - 标题
   * @param {String} content - 内容
   * @param {String} plate - 板块
   * @param {String} tags - 标签
   * @returns {JSON} - 返回修改博客结果
   */
  Update_Blog(blogid, title, content, plate, tags) {
    const url = 'post/action/' + blogid + '/';
    return apiClient.patch(url, { title, content, plate, tags });
  },

  /**
   * 删除博客
   * @param {Number} blogid - 博客ID
   * @returns {JSON} - 返回删除博客结果
   */
  Delete_Blog(blogid) {
    const url = 'post/action/' + blogid + '/';
    return apiClient.delete(url);
  },

  /**
   * 点赞博客
   * @param {Number} blogid - 博客ID
   * @returns {JSON} - 返回点赞博客结果
   */
  Like_Blog(blogid) {
    const url = 'post/like/' + blogid + '/';
    return apiClient.get(url);
  },

  /**
   * 取消点赞博客
   * @param {Number} blogid - 博客ID
   * @returns {JSON} - 返回取消点赞博客结果
   */
  Unlike_Blog(blogid) {
    const url = 'post/like/' + blogid + '/';
    return apiClient.delete(url);
  },

  /**
   * 收藏博客
   * @param {Number} blogid - 博客ID
   * @returns {JSON} - 返回收藏博客结果
   */
  Collect_Blog(blogid) {
    const url = 'post/collect/' + blogid + '/';
    return apiClient.get(url);
  },

  /**
   * 取消收藏博客
   * @param {Number} blogid - 博客ID
   * @returns {JSON} - 返回取消收藏博客结果
   */
  Uncollect_Blog(blogid) {
    const url = 'post/collect/' + blogid + '/';
    return apiClient.delete(url);
  },

  /**
   * 博客封面获取
   * @param {Number} blogid - 博客ID
   * @returns {JSON} - 返回博客封面获取结果
   */
  Get_Blog_Cover(blogid) {
    const url = 'post/coverImg/' + blogid + '/';
    return apiClient.get(url);
  },

  /**
   * 博客封面上传及修改
   * @param {Number} blogid - 博客ID
   * @param {File} coverImg - 封面
   * @returns {JSON} - 返回博客封面上传结果
   * @description 上传成功后, 会返回封面的 URL
   */
  Upload_Blog_Cover(blogid, coverImg) {
    const url = 'post/coverImg/' + blogid + '/';
    return apiClient.post(url, { coverImg });
  },

  /**
   * 博客封面删除
   * @param {Number} blogid - 博客ID
   * @returns {JSON} - 返回博客封面删除结果
   */
  Delete_Blog_Cover(blogid) {
    const url = 'post/coverImg/' + blogid + '/';
    return apiClient.delete(url);
  },

  //#region 博客 ====================


  //#region 板块 ====================


  /**
   * 获取板块列表
   * @param {Number} page - 页码
   * @param {Number} page_size - 每页数量
   * @returns {JSON} - 返回板块列表
   */
  Get_All_Plates(page = 1, page_size = 10) {
    return apiClient.get('/plate/list/', {
      page: page, // 页码
      page_size: page_size // 每页数量
    });
  },

  /**
   * 搜索板块
   * @param {string} plateID - 板块ID关键字
   * @param {string} name - 板块名称关键字
   * @param {Number} page - 页码
   * @param {Number} page_size - 每页数量
   * @returns {JSON} - 返回搜索结果
   */
  Search_Plates(plateID, name, page = 1, page_size = 10) {
    return apiClient.post('/plate/list/', {
      plateID: plateID,
      name: name,
      page: page,
      page_size: page_size
    });
  },

  /**
   * 获取板块详情
   * @param {Number} plateid - 板块ID
   * @returns {JSON} - 返回板块详情
   */
  Get_Plate_Detail(plateid) {
    const url = '/plate/' + plateid + '/';
    return apiClient.get(url);
  },

  /**
   * 创建板块
   * @param {String} name - 板块名称
   * @param {String} description - 板块描述
   * @returns {JSON} - 返回创建板块结果
   */
  Create_Plate(name, description) {
    const url = 'plate/create/';
    return apiClient.post(url, { name, description });
  },

  /**
   * 修改板块
   * @param {Number} plateid - 板块ID
   * @param {String} name - 板块名称
   * @param {String} description - 板块描述
   * @returns {JSON} - 返回修改板块结果
   * @description 板块ID不可修改
   */
  Update_Plate(plateid, name, description) {
    const url = 'plate/action/' + plateid + '/';
    return apiClient.patch(url, { name, description });
  },

  /**
   * 删除板块
   * @param {Number} plateid - 板块ID
   * @returns {JSON} - 返回删除板块结果
   */
  Delete_Plate(plateid) {
    const url = 'plate/action/' + plateid + '/';
    return apiClient.delete(url);
  },

  /**
   * 获取所有板块管理列表
   * @param {Number} page - 页码
   * @param {Number} page_size - 每页数量
   * @returns {JSON} - 返回所有板块管理列表
   */
  Get_All_Plate_Manage_List(page = 1, page_size = 10) {
    return apiClient.get('/plate/manage/list/', {
      page: page, // 页码
      page_size: page_size // 每页数量
    });
  },

  /**
   * 获取板块管理列表, 可搜索
   * @param {Number} mpID - 管理记录ID
   * @param {Number} plate__plateID - 板块ID
   * @param {String} plate__name - 板块名称
   * @param {Number} moderator__userID - 版主用户ID
   * @param {String} moderator__username - 版主用户名
   * @param {Number} page - 页码
   * @param {Number} page_size - 每页数量
   * @returns {JSON} - 返回板块管理列表
   */
  Get_Plate_Manage_List(mpID, plate__plateID, plate__name, moderator__userID, moderator__username, page = 1, page_size = 10) {
    return apiClient.post('/plate/manage/list/', {
      mpID: mpID,
      plate__plateID: plate__plateID,
      plate__name: plate__name,
      moderator__userID: moderator__userID,
      moderator__username: moderator__username,
      page: page,
      page_size: page_size
    });
  },

  /**
   * 获取板块管理详情
   * @param {Number} mpID - 管理记录ID
   * @returns {JSON} - 返回板块管理详情
   */
  Get_Plate_Manage_Detail(mpID) {
    const url = '/plate/manage/' + mpID + '/';
    return apiClient.get(url);
  },

  /**
   * 任命版主
   * @param {Number} plateid - 板块ID
   * @param {Number} userid - 用户ID
   * @returns {JSON} - 返回任命版主结果
   * @description 任命版主后, 会自动创建板块管理记录
   * @description 任命版主后, 会自动将用户加入版主组
   */
  Appoint_Moderator(plateid, userid) {
    const url = 'plate/manage/create/';
    return apiClient.post(url, { plate: plateid, moderator: userid });
  },

  /**
   * 取消任命版主
   * @param {Number} mpID - 管理记录ID
   * @returns {JSON} - 返回取消任命版主结果
   */
  Cancel_Moderator(mpID) {
    const url = 'plate/manage/' + mpID + '/';
    return apiClient.delete(url);
  },

  //#region 板块 ====================



  //#region 评论 ====================

  /**
   * 获取评论列表, 可搜索
   * @param {Number} blogid - 博客ID
   * @param {Number} author - 作者用户ID
   * @param {Number} parent - 父评论ID
   * @param {Number} reply_to - 回复评论ID
   * @param {Number} page - 页码
   * @param {Number} page_size - 每页数量
   * @returns {JSON} - 返回评论列表
   * @description 评论列表按时间倒序排列
   */
  Get_Comment_List(blogid, author, parent, reply_to, page = 1, page_size = 10) {
    return apiClient.post('/post/comment/list/' + blogid + '/', {
      post: blogid,
      author: author,
      parent: parent,
      reply_to: reply_to,
      page: page,
      page_size: page_size
    });
  },

  /**
   * 评论博客和回复评论
   * @param {Number} blogid - 博客ID
   * @param {String} content - 评论内容
   * @param {Number} parent - 父评论ID
   * @returns {JSON} - 返回评论博客和回复评论结果
   * @description 评论博客时, parent 为 null
   * @description 回复评论时, parent 为被回复的评论ID, 超过两级回复时, parent 为最上层的评论ID
   */
  Comment_Blog(blogid, content, parent) {
    const url = '/comment/create/';
    return apiClient.post(url, {
      post: blogid,
      content: content,
      parent: parent
    });
  },

  /**
   * 获取评论详情
   * @param {Number} commentid - 评论ID
   * @returns {JSON} - 返回评论详情
   */
  Get_Comment_Detail(commentid) {
    const url = '/comment/detail/' + commentid + '/';
    return apiClient.get(url);
  },

  /**
   * 修改评论
   * @param {Number} commentid - 评论ID
   * @param {String} content - 评论内容
   * @returns {JSON} - 返回修改评论结果
   */
  Update_Comment(commentid, content) {
    const url = '/comment/action/' + commentid + '/';
    return apiClient.patch(url, { content });
  },

  /**
   * 删除评论
   * @param {Number} commentid - 评论ID
   * @returns {JSON} - 返回删除评论结果
   * @description 删除根评论后, 会自动删除其下的所有回复评论
   */
  Delete_Comment(commentid) {
    const url = '/comment/action/' + commentid + '/';
    return apiClient.delete(url);
  },

  /**
   * 点赞评论
   * @param {Number} commentid - 评论ID
   * @returns {JSON} - 返回点赞评论结果
   */
  Like_Comment(commentid) {
    const url = '/comment/like/' + commentid + '/';
    return apiClient.get(url);
  },

  /**
   * 取消点赞评论
   * @param {Number} commentid - 评论ID
   * @returns {JSON} - 返回取消点赞评论结果
   */
  Unlike_Comment(commentid) {
    const url = '/comment/like/' + commentid + '/';
    return apiClient.delete(url);
  },

  /**
   * 收藏评论
   * @param {Number} commentid - 评论ID
   * @returns {JSON} - 返回收藏评论结果
   */
  Collect_Comment(commentid) {
    const url = '/comment/collect/' + commentid + '/';
    return apiClient.get(url);
  },

  /**
   * 取消收藏评论
   * @param {Number} commentid - 评论ID
   * @returns {JSON} - 返回取消收藏评论结果
   */
  Uncollect_Comment(commentid) {
    const url = '/comment/collect/' + commentid + '/';
    return apiClient.delete(url);
  },


  //#region 评论 ====================






  //===================================================================================================
  // 以下是原有的函数, 待修改后删除
  Select_All_My_Blogs() {
    return apiClient.get('/post/list/');
  },
  Search_Blogs2(author__userID, plate__plateID, postID, title, content, author__username, tags__name, plate__name, is_essence, page = 1, page_size = 10) {
    return apiClient.post('/post/list/', {
      postID: postID,
      title: title,
      content: content,
      author__userID: author__userID,
      author__username: author__username,
      tags__name: tags__name,
      plate__plateID: plate__plateID,
      plate__name: plate__name,
      is_essence: is_essence,
      page: page,
      page_size: page_size
    });
  },

  Select_All_Blogs() {
    return apiClient.get('/post/list/');
  },

  Select_Blogs_By_Part(plate) {
    return apiClient.get('/post/list/', { plate });
  },

  Select_Conditional_Blogs(title) {
    return apiClient.post('/SCB', { title: title });
  },
  isInputRight(name, password) {
    return Login_apiClient.post('/Login_Judge', { name, password });
  },
  SelectBlog(user_id, blog_id) {
    return apiClient.post('/SB', { user_id: user_id, blog_id: blog_id });
  },
  select_profile(id) {
    return apiClient.post('/SP', { user_id: id });
  },
  insertComment(user_id, blog_id, content) {
    return apiClient.post('/IC', { user_id: user_id, blog_id: blog_id, content: content });
  },

  Update_Likes(user_id, blog_id, user_like) {
    return apiClient.post('/UL', { user_id: user_id, blog_id: blog_id, user_like: user_like });
  },
  insertBlog(user_id, type_name, description, title, content) {
    return apiClient.post('/IB', { user_id: user_id, type_name: type_name, description: description, title: title, content: content });
  },
  UpdatePhone(user_id, phone) {
    return apiClient.post('/UP', { user_id: user_id, phone_number: phone });
  },
  UpdateAvatar(user_id, avatar) {
    return apiClient.post('/UA', { user_id: user_id, avatar: avatar });
  },
  UpdateEmail(user_id, email) {
    return apiClient.post('/UE', { user_id: user_id, email: email });
  },
  UpdateName(user_id, user_name) {
    return apiClient.post('/UN', { user_id: user_id, user_name: user_name });
  },
  search_my_blogs(user_id) {
    return apiClient.post('/SMB', { user_id: user_id });
  },
  Update_blog_Content(blog_id, user_id, content) {
    return apiClient.post('/UBC', { blog_id: blog_id, user_id: user_id, content: content });
  },
  Update_blog_Title(blog_id, user_id, title) {
    return apiClient.post('/UBTitle', { blog_id: blog_id, user_id: user_id, title: title });
  },
  Update_blog_Type(blog_id, user_id, type_name) {
    return apiClient.post('/UBType', { blog_id: blog_id, user_id: user_id, type_name: type_name });
  },
  Update_blog_Description(blog_id, user_id, description) {
    return apiClient.post('/UBD', { blog_id: blog_id, user_id: user_id, description: description });
  },
  delete_blog(blog_id, user_id) {
    return apiClient.post('/DB', { blog_id: blog_id, user_id: user_id });
  }
};
