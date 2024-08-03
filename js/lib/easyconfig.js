/**
 * EasyConfig.js v0.0.3
 * by cmd1152
 */


/**
 * 创建一个会保存在 localStore 的对象，可以用于存储配置文件
 * @param {string} id - 要获取和保存的数据在 localStorage 中的唯一标识符
 * @param {object} defData - 可选（默认的数据）
 * @returns {proxy} - Proxy 对象（监听和自动保存数据）
 */
window.easyconfig = (id, defData={}) => {
  let data = localStorage.getItem(id);
  if (data) {
    try {
      data = deepMerge(defData, JSON.parse(data));
    } catch (error) {
      console.warn(`id为 ${id} 的数据可能已经损坏`, data);
      return defData;
    }
  }

  // Proxy 对象秒天下
  const handler = {
    set: function(target, prop, value) {
      // 用 obj.xxxx = xxx 的时候触发
      target[prop] = value;
      localStorage.setItem(id, JSON.stringify(target));
      return true;
    },
    deleteProperty: function(target, prop) {
      // 用 delete obj.xxxx 时触发
      delete target[prop];
      localStorage.setItem(id, JSON.stringify(target));
      return true;
    }
  };

  // 创建 Proxy 对象来包裹数据
  const proxy = new Proxy(data || defData || {}, handler);

  return proxy;
}

/**
 * 递归地将两个对象的属性合并到第一个对象中。
 * 如果两个对象具有相同键的属性且均为对象，则函数将递归合并这些属性。
 *
 * @param {Object} target - 合并的目标对象。
 * @param {Object} source - 包含要合并属性的源对象。
 * @returns {void} - 经过合并操作后的目标对象。
 *
 * @example
 * // 示例对象
 * let a = { t: { a: 1, b: 2 } };
 * let b = { t: { a: 1 } };
 *
 * // 执行深度合并
 * deepMerge(b, a);
 * console.log(b); // 输出: { t: { a: 1, b: 2 } }
 */
function deepMerge(target, source) {
  for (let key in source) {
    if (source[key] instanceof Object) {
      if (key in target && target[key] instanceof Object) {
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    } else {
      target[key] = source[key];
    }
  }
  return target;
}