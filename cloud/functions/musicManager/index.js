// 添加音乐
async function addMusic(event) {
  const { 
    name,           // 音乐名称
    audioUrl,       // 音乐链接
    title,          // 标题
    backgroundUrl,  // 音乐背景图
    iconUrl,        // 音乐播放图标
    listImageUrl,   // 音乐列表图
    subtitle,       // 副标题
    categoryId      // 分类ID
  } = event
  
  // 输入验证
  if (!name || name.trim() === '') {
    return {
      success: false,
      error: '音乐名称不能为空'
    }
  }
  
  if (!audioUrl || audioUrl.trim() === '') {
    return {
      success: false,
      error: '音乐链接不能为空'
    }
  }
  
  if (!title || title.trim() === '') {
    return {
      success: false,
      error: '标题不能为空'
    }
  }
  
  if (!categoryId) {
    return {
      success: false,
      error: '分类ID不能为空'
    }
  }
  
  try {
    // 添加音乐记录
    const newMusic = {
      name: name.trim(),
      audioUrl: audioUrl.trim(),
      title: title.trim(),
      backgroundUrl: backgroundUrl || '',
      iconUrl: iconUrl || '',
      listImageUrl: listImageUrl || '',
      subtitle: subtitle || '',
      categoryId,
      createTime: db.serverDate(),
      playCount: 0,  // 初始播放次数为0
      order: 0       // 默认排序
    }
    
    const result = await db.collection('music').add({
      data: newMusic
    })
    
    // 获取新添加的音乐完整信息
    const newMusicData = await db.collection('music').doc(result._id).get()
    
    return {
      success: true,
      data: newMusicData.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || '添加音乐失败'
    }
  }
} 