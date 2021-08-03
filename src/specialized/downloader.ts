// 获取模型文件名字（xxx.skel, xxx.png, xxx.atlas的xxx）
export const modelNameUrl = (name: string): string => `https://desktop.huix.cc/api/arknights/${name}/model`

// 获取下载模型文件的基础URL（在其后加.skel等）
export const modelOrigin = (name: string, modelName: string): string => `https://desktop.huix.cc/api/arknights/${name}/model/${modelName}`
