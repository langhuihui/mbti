// MBTI认知功能数组
const mbtiCognitiveFunctions = [
    'Fe', // 外向情感 (Extraverted Feeling)
    'Fi', // 内向情感 (Introverted Feeling)
    'Te', // 外向思维 (Extraverted Thinking)
    'Ti', // 内向思维 (Introverted Thinking)
    'Se', // 外向感觉 (Extraverted Sensing)
    'Si', // 内向感觉 (Introverted Sensing)
    'Ne', // 外向直觉 (Extraverted iNtuition)
    'Ni'  // 内向直觉 (Introverted iNtuition)
];

// 顶点位置映射
const vertexPositions = {
    'Fe': [-1, -1, 1],   // 左上前
    'Ni': [1, -1, 1],    // 右上前
    'Te': [1, -1, -1],   // 右上后
    'Si': [-1, -1, -1],  // 左上后
    'Ti': [-1, 1, 1],    // 左下前
    'Se': [1, 1, 1],     // 右下前
    'Fi': [1, 1, -1],    // 右下后
    'Ne': [-1, 1, -1]    // 左下后
};

// 边的配置
const edges = [
    // 彩色边
    { start: 'Fe', end: 'Ni', color: 'green' },
    { start: 'Fi', end: 'Ne', color: 'green' },
    { start: 'Se', end: 'Ti', color: 'yellow' },
    { start: 'Se', end: 'Fi', color: 'yellow' },
    { start: 'Si', end: 'Te', color: 'blue' },
    { start: 'Fe', end: 'Si', color: 'blue' },
    { start: 'Ni', end: 'Te', color: 'purple' },
    { start: 'Ti', end: 'Ne', color: 'purple' },
    
    // 黑色垂直边
    { start: 'Fe', end: 'Ti', color: 'black' },  // 左前
    { start: 'Ni', end: 'Se', color: 'black' },  // 右前
    { start: 'Te', end: 'Fi', color: 'black' },  // 右后
    { start: 'Si', end: 'Ne', color: 'black' }   // 左后
];

// 添加字母位置
const letterPositions = {
    'J': [0, -1, 0],  // 上平面中心
    'P': [0, 1, 0]    // 下平面中心
};

// MBTI类型标注位置（在边的端点附近）
const mbtiTypePositions = {
    'ENFJ': { base: 'Fe', aux: 'Ni', position: 0.2 },  // 靠近Fe
    'ENTJ': { base: 'Te', aux: 'Ni', position: 0.2 },  // 靠近Te
    'INFJ': { base: 'Ni', aux: 'Fe', position: 0.2 },  // 靠近Ni
    'INTJ': { base: 'Ni', aux: 'Te', position: 0.2 },  // 靠近Ni
    'ENFP': { base: 'Ne', aux: 'Fi', position: 0.2 },  // 靠近Ne
    'ENTP': { base: 'Ne', aux: 'Ti', position: 0.2 },  // 靠近Ne
    'INFP': { base: 'Fi', aux: 'Ne', position: 0.2 },  // 靠近Fi
    'INTP': { base: 'Ti', aux: 'Ne', position: 0.2 },  // 靠近Ti
    'ESFJ': { base: 'Fe', aux: 'Si', position: 0.2 },  // 靠近Fe
    'ESTJ': { base: 'Te', aux: 'Si', position: 0.2 },  // 靠近Te
    'ISFJ': { base: 'Si', aux: 'Fe', position: 0.2 },  // 靠近Si
    'ISTJ': { base: 'Si', aux: 'Te', position: 0.2 },  // 靠近Si
    'ESFP': { base: 'Se', aux: 'Fi', position: 0.2 },  // 靠近Se
    'ESTP': { base: 'Se', aux: 'Ti', position: 0.2 },  // 靠近Se
    'ISFP': { base: 'Fi', aux: 'Se', position: 0.2 },  // 靠近Fi
    'ISTP': { base: 'Ti', aux: 'Se', position: 0.2 }   // 靠近Ti
};

// 创建线段
function createLine(start, end, color) {
    const line = document.createElement('div');
    line.className = `line line-${color}`;
    return line;
}

// 更新线段
function updateLine(line, start, end, rotateX, rotateY) {
    const startPos = vertexPositions[start];
    const endPos = vertexPositions[end];
    
    // 获取投影后的坐标
    const [startX, startY, startZ] = project3DTo2D(startPos, rotateX, rotateY);
    const [endX, endY, endZ] = project3DTo2D(endPos, rotateX, rotateY);
    
    // 计算线段的长度和角度
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // 使用2D变换设置线段位置
    line.style.width = `${length}px`;
    line.style.transform = `translate(${startX}px, ${startY}px) rotate(${angle}rad)`;
    
    // 根据平均Z坐标设置深度
    const avgZ = (startZ + endZ) / 2;
    line.style.zIndex = Math.round(1000 - avgZ);
}

// 辅助函数：旋转点
function rotatePoint(point, angleX, angleY) {
    let [x, y, z] = point;
    
    // 绕Y轴旋转
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const newX = x * cosY - z * sinY;
    const newZ = x * sinY + z * cosY;
    
    // 绕X轴旋转
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const newY = y * cosX + newZ * sinX;
    z = -y * sinX + newZ * cosX;
    
    return [newX, newY, z];
}

// 更新所有标签位置
function updateAllLabels(rotateX, rotateY) {
    requestAnimationFrame(() => {
        // 更新认知功能和字母标签
        const labels = document.querySelectorAll('.label:not(.mbti-type)');
        labels.forEach(label => {
            const id = label.textContent;
            const pos = vertexPositions[id] || letterPositions[id];
            if (pos) {
                updateLabelPosition(label, pos, rotateX, rotateY);
            }
        });

        // 更新MBTI类型标签
        const mbtiLabels = document.querySelectorAll('.mbti-type');
        mbtiLabels.forEach(label => {
            const type = label.textContent;
            const { base, aux, position } = mbtiTypePositions[type];
            updateMbtiTypePosition(label, base, aux, position, rotateX, rotateY);
        });
    });
}

// 更新所有线段
function updateAllLines(rotateX, rotateY) {
    requestAnimationFrame(() => {
        const lines = document.querySelectorAll('.line');
        edges.forEach((edge, index) => {
            updateLine(lines[index], edge.start, edge.end, rotateX, rotateY);
        });
    });
}

// 修改createLabel函数以支持不同样式的标签
function createLabel(id, position, isLetter = false) {
    const label = document.createElement('div');
    label.className = isLetter ? 'label letter' : 'label';
    label.textContent = id;
    
    // 计算2D位置
    updateLabelPosition(label, position);
    
    return label;
}

// 3D矩阵计算
function multiplyMatrixAndPoint(matrix, point) {
    const [x, y, z, w = 1] = point;
    return [
        matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z + matrix[0][3] * w,
        matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z + matrix[1][3] * w,
        matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z + matrix[2][3] * w,
        matrix[3][0] * x + matrix[3][1] * y + matrix[3][2] * z + matrix[3][3] * w
    ];
}

function createRotationMatrix(angleX, angleY) {
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    // 创建单独的旋转矩阵
    const rotationX = [
        [1, 0, 0, 0],
        [0, cosX, -sinX, 0],
        [0, sinX, cosX, 0],
        [0, 0, 0, 1]
    ];

    const rotationY = [
        [cosY, 0, sinY, 0],
        [0, 1, 0, 0],
        [-sinY, 0, cosY, 0],
        [0, 0, 0, 1]
    ];

    // 组合旋转矩阵（先Y后X）
    return multiplyMatrices(rotationX, rotationY);
}

function multiplyMatrices(a, b) {
    return [
        [
            a[0][0] * b[0][0] + a[0][1] * b[1][0] + a[0][2] * b[2][0] + a[0][3] * b[3][0],
            a[0][0] * b[0][1] + a[0][1] * b[1][1] + a[0][2] * b[2][1] + a[0][3] * b[3][1],
            a[0][0] * b[0][2] + a[0][1] * b[1][2] + a[0][2] * b[2][2] + a[0][3] * b[3][2],
            a[0][0] * b[0][3] + a[0][1] * b[1][3] + a[0][2] * b[2][3] + a[0][3] * b[3][3]
        ],
        [
            a[1][0] * b[0][0] + a[1][1] * b[1][0] + a[1][2] * b[2][0] + a[1][3] * b[3][0],
            a[1][0] * b[0][1] + a[1][1] * b[1][1] + a[1][2] * b[2][1] + a[1][3] * b[3][1],
            a[1][0] * b[0][2] + a[1][1] * b[1][2] + a[1][2] * b[2][2] + a[1][3] * b[3][2],
            a[1][0] * b[0][3] + a[1][1] * b[1][3] + a[1][2] * b[2][3] + a[1][3] * b[3][3]
        ],
        [
            a[2][0] * b[0][0] + a[2][1] * b[1][0] + a[2][2] * b[2][0] + a[2][3] * b[3][0],
            a[2][0] * b[0][1] + a[2][1] * b[1][1] + a[2][2] * b[2][1] + a[2][3] * b[3][1],
            a[2][0] * b[0][2] + a[2][1] * b[1][2] + a[2][2] * b[2][2] + a[2][3] * b[3][2],
            a[2][0] * b[0][3] + a[2][1] * b[1][3] + a[2][2] * b[2][3] + a[2][3] * b[3][3]
        ],
        [
            a[3][0] * b[0][0] + a[3][1] * b[1][0] + a[3][2] * b[2][0] + a[3][3] * b[3][0],
            a[3][0] * b[0][1] + a[3][1] * b[1][1] + a[3][2] * b[2][1] + a[3][3] * b[3][1],
            a[3][0] * b[0][2] + a[3][1] * b[1][2] + a[3][2] * b[2][2] + a[3][3] * b[3][2],
            a[3][0] * b[0][3] + a[3][1] * b[1][3] + a[3][2] * b[2][3] + a[3][3] * b[3][3]
        ]
    ];
}

function createPerspectiveMatrix(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    const rangeInv = 1.0 / (near - far);

    return [
        [f/aspect, 0, 0, 0],
        [0, f, 0, 0],
        [0, 0, (near + far) * rangeInv, 2 * near * far * rangeInv],
        [0, 0, -1, 0]
    ];
}

// 透视参数
let perspectiveParams = {
    cameraDistance: 3
};

// 旋转角度
let initialRotateX = -20;
let initialRotateY = 45;

// 自动旋转控制
let isAutoRotating = true;
let autoRotateSpeed = 0.2;

// 修改project3DTo2D函数
function project3DTo2D(point, rotateX, rotateY) {
    // 转换角度到弧度
    const angleY = (rotateY * Math.PI) / 180;
    const angleX = (rotateX * Math.PI) / 180;
    
    // 应用变换
    let [x, y, z] = point;
    
    // 先绕Y轴旋转
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const tempX = x * cosY - z * sinY;
    const tempZ = x * sinY + z * cosY;
    
    // 再绕X轴旋转
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const tempY = y * cosX + tempZ * sinX;
    z = -y * sinX + tempZ * cosX;
    x = tempX;
    y = tempY;

    // 获取容器尺寸
    const container = document.querySelector('.scene-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const isMobile = window.innerWidth <= 800;

    // 根据屏幕大小调整缩放
    const scale = isMobile ? 
        Math.min(containerWidth, containerHeight) * 0.25 : 
        150;
    
    x *= scale;
    y *= scale;
    z *= scale;

    // 应用简单的透视投影
    const cameraZ = perspectiveParams.cameraDistance * (isMobile ? 150 : 200);
    const scale2d = cameraZ / (cameraZ + z);
    
    // 计算屏幕坐标（相对于场景中心）
    const screenX = containerWidth / 2 + x * scale2d;
    const screenY = containerHeight / 2 + y * scale2d;
    
    return [screenX, screenY, z];
}

// 自动旋转函数
function autoRotate() {
    if (isAutoRotating) {
        initialRotateY += autoRotateSpeed;
        updateAllLabels(initialRotateX, initialRotateY);
        updateAllLines(initialRotateX, initialRotateY);
    }
    requestAnimationFrame(autoRotate);
}

// 更新标签位置
function updateLabelPosition(label, position, rotateX, rotateY) {
    const [x, y, z] = project3DTo2D(position, rotateX, rotateY);
    
    // 使用简单的位置设置
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    label.style.transform = 'translate(-50%, -50%)';
    
    // 只保留z-index
    label.style.zIndex = Math.round(1000 - z);
}

// 创建MBTI类型标签
function createMbtiTypeLabel(type, basePos, auxPos) {
    const label = document.createElement('div');
    label.className = 'label mbti-type';
    label.textContent = type;

    // 添加缩略图容器
    const thumb = document.createElement('div');
    thumb.className = 'mbti-type-thumb';
    
    // 添加缩略图
    const img = document.createElement('img');
    img.src = mbtiImages[type];
    img.alt = `${type} 缩略图`;
    thumb.appendChild(img);
    
    // 将缩略图添加到标签
    label.appendChild(thumb);
    
    return label;
}

// 更新MBTI类型标签位置
function updateMbtiTypePosition(label, basePos, auxPos, position, rotateX, rotateY) {
    // 计算两个顶点的位置
    const [baseX, baseY, baseZ] = project3DTo2D(vertexPositions[basePos], rotateX, rotateY);
    const [auxX, auxY, auxZ] = project3DTo2D(vertexPositions[auxPos], rotateX, rotateY);
    
    // 根据position参数计算标签位置（使用线性插值）
    const x = baseX + (auxX - baseX) * position;
    const y = baseY + (auxY - baseY) * position;
    const z = baseZ + (auxZ - baseZ) * position;
    
    // 设置标签位置
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    label.style.transform = 'translate(-50%, -50%)';
    label.style.zIndex = Math.round(1000 - z);
}

// MBTI认知功能顺序
const mbtiCognitiveFunctionOrder = {
    'ENFJ': ['Fe', 'Ni', 'Se', 'Ti'],
    'ENTJ': ['Te', 'Ni', 'Se', 'Fi'],
    'INFJ': ['Ni', 'Fe', 'Ti', 'Se'],
    'INTJ': ['Ni', 'Te', 'Fi', 'Se'],
    'ENFP': ['Ne', 'Fi', 'Te', 'Si'],
    'ENTP': ['Ne', 'Ti', 'Fe', 'Si'],
    'INFP': ['Fi', 'Ne', 'Si', 'Te'],
    'INTP': ['Ti', 'Ne', 'Si', 'Fe'],
    'ESFJ': ['Fe', 'Si', 'Ne', 'Ti'],
    'ESTJ': ['Te', 'Si', 'Ne', 'Fi'],
    'ISFJ': ['Si', 'Fe', 'Ti', 'Ne'],
    'ISTJ': ['Si', 'Te', 'Fi', 'Ne'],
    'ESFP': ['Se', 'Fi', 'Te', 'Ni'],
    'ESTP': ['Se', 'Ti', 'Fe', 'Ni'],
    'ISFP': ['Fi', 'Se', 'Ni', 'Te'],
    'ISTP': ['Ti', 'Se', 'Ni', 'Fe']
};

let currentAnimation = null;
let functionBall = null;

// 创建认知功能动画小球
function createFunctionBall() {
    // 先清理所有已存在的小球
    document.querySelectorAll('.function-ball').forEach(ball => ball.remove());
    
    // 创建新的小球
    functionBall = document.createElement('div');
    functionBall.className = 'function-ball';
    document.querySelector('.scene-container').appendChild(functionBall);
    return functionBall;
}

// 获取MBTI类型所在边的颜色
function getMbtiTypeColor(type) {
    const { base, aux } = mbtiTypePositions[type];
    const edge = edges.find(e => 
        (e.start === base && e.end === aux) || 
        (e.start === aux && e.end === base)
    );
    return edge ? edge.color : 'black';
}

// 更新功能位显示
function updateFunctionsDisplay(type) {
    const panel = document.querySelector('.functions-panel');
    const header = panel.querySelector('.functions-panel-header');
    const functionItems = panel.querySelectorAll('.function-item');
    const functionTexts = panel.querySelectorAll('.function-text');
    
    if (!type) {
        panel.classList.remove('visible');
        return;
    }

    // 更新标题
    header.textContent = `${type} 认知功能`;

    // 获取认知功能顺序
    const functions = mbtiCognitiveFunctionOrder[type];
    if (!functions) return;

    // 计算所有8个功能位
    const allFunctions = [...functions];
    // 添加对立函数
    functions.forEach(func => {
        const oppositeFunc = func.charAt(1) === 'e' ? 
            func.charAt(0) + 'i' : 
            func.charAt(0) + 'e';
        if (!allFunctions.includes(oppositeFunc)) {
            allFunctions.push(oppositeFunc);
        }
    });

    // 更新显示
    functionTexts.forEach((item, index) => {
        item.textContent = allFunctions[index] || '--';
    });

    panel.classList.add('visible');
}

// 高亮当前认知功能和对应的功能位
function highlightFunction(functionId, color) {
    // 高亮顶点标签
    document.querySelectorAll('.label').forEach(l => {
        l.classList.remove('highlight-green', 'highlight-yellow', 'highlight-blue', 'highlight-purple');
    });
    const targetLabel = Array.from(document.querySelectorAll('.label')).find(label => label.textContent === functionId);
    if (targetLabel) {
        targetLabel.classList.add(`highlight-${color}`);
    }

    // 高亮功能位列表项
    const functionItems = document.querySelectorAll('.function-item');
    functionItems.forEach(item => {
        item.classList.remove('highlight-green', 'highlight-yellow', 'highlight-blue', 'highlight-purple');
        const functionText = item.querySelector('.function-text');
        if (functionText && functionText.textContent === functionId) {
            item.classList.add(`highlight-${color}`);
        }
    });
}

// 移动小球到指定认知功能
function moveBallToFunction(functionId, color, duration = 1000) {
    const ball = createFunctionBall();
    const targetLabel = Array.from(document.querySelectorAll('.label')).find(label => label.textContent === functionId);
    
    if (!targetLabel) return Promise.reject('Label not found');

    const rect = targetLabel.getBoundingClientRect();
    const containerRect = document.querySelector('.scene-container').getBoundingClientRect();
    
    // 确保小球可见并设置颜色
    ball.style.opacity = '1';
    ball.classList.add('active');
    ball.className = `function-ball active color-${color}`;
    
    return new Promise((resolve) => {
        // 计算小球应该在标签的中心位置
        const centerX = rect.left - containerRect.left + rect.width / 2;
        const centerY = rect.top - containerRect.top + rect.height / 2;
        
        // 设置初始位置（如果还没有设置的话）
        if (!ball.style.left) {
            ball.style.left = `${centerX}px`;
            ball.style.top = `${centerY}px`;
        }
        
        // 添加过渡动画
        ball.style.transition = `all ${duration}ms ease`;
        
        // 使用 requestAnimationFrame 确保过渡属性生效
        requestAnimationFrame(() => {
            ball.style.left = `${centerX}px`;
            ball.style.top = `${centerY}px`;
            
            // 高亮当前认知功能和功能位
            highlightFunction(functionId, color);
        });
        
        setTimeout(resolve, duration);
    });
}

// 动画序列
async function animateCognitiveFunctions(type) {
    const functions = mbtiCognitiveFunctionOrder[type];
    if (!functions) return;

    const color = getMbtiTypeColor(type);

    // 停止自动旋转
    isAutoRotating = false;
    
    // 清理所有已存在的小球
    document.querySelectorAll('.function-ball').forEach(ball => ball.remove());
    functionBall = null;

    // 移除所有MBTI类型标签的选中状态和功能位高亮
    document.querySelectorAll('.mbti-type').forEach(label => {
        label.classList.remove('selected-green', 'selected-yellow', 'selected-blue', 'selected-purple');
    });
    document.querySelectorAll('.function-item').forEach(item => {
        item.classList.remove('highlight-green', 'highlight-yellow', 'highlight-blue', 'highlight-purple');
    });

    // 为当前MBTI类型标签添加选中状态
    const currentLabel = Array.from(document.querySelectorAll('.mbti-type')).find(label => label.textContent === type);
    if (currentLabel) {
        currentLabel.classList.add(`selected-${color}`);
    }

    try {
        while (currentAnimation === type) {
            // 创建新的小球并立即移动到第一个功能位置
            const ball = createFunctionBall();
            ball.style.opacity = '0';
            ball.classList.add('active', `color-${color}`);
            
            // 移动到第一个功能位置并显示
            await moveBallToFunction(functions[0], color, 0);
            requestAnimationFrame(() => {
                ball.style.opacity = '1';
            });
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // 依次移动到其他功能
            for (let i = 1; i < functions.length && currentAnimation === type; i++) {
                await moveBallToFunction(functions[i], color);
            }
            
            // 淡出小球
            if (currentAnimation === type) {
                ball.style.opacity = '0';
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // 移除旧的小球
                if (ball) {
                    ball.remove();
                }
                functionBall = null;
                
                // 等待一小段时间后继续下一轮
                if (currentAnimation === type) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
        }
    } catch (error) {
        console.error('Animation error:', error);
    }

    // 如果动画被中断，清理小球和高亮效果
    document.querySelectorAll('.function-ball').forEach(ball => ball.remove());
    functionBall = null;
    
    document.querySelectorAll('.label').forEach(l => {
        l.classList.remove('highlight-green', 'highlight-yellow', 'highlight-blue', 'highlight-purple');
    });
    document.querySelectorAll('.function-item').forEach(item => {
        item.classList.remove('highlight-green', 'highlight-yellow', 'highlight-blue', 'highlight-purple');
    });
    // 移除MBTI类型标签的选中状态
    if (currentLabel) {
        currentLabel.classList.remove(`selected-${color}`);
    }
}

// 重置视图函数
function resetView() {
    // 检查当前视角是否已经是初始状态
    const isInitialState = Math.abs(initialRotateX - (-20)) < 0.1 && Math.abs(initialRotateY % 360 - 45) < 0.1;
    
    // 检查是否有选中的MBTI类型
    const hasSelectedType = document.querySelector('.mbti-type.selected-green, .mbti-type.selected-yellow, .mbti-type.selected-blue, .mbti-type.selected-purple');
    
    // 只有在不是初始状态时才重置视角
    if (!isInitialState) {
        // 如果有选中的类型，保持自动旋转为关闭状态
        if (hasSelectedType) {
            isAutoRotating = false;
        }
        
        // 重置视角
        initialRotateX = -20;
        initialRotateY = 45;
        updateAllLabels(initialRotateX, initialRotateY);
        updateAllLines(initialRotateX, initialRotateY);
    }
}

// MBTI形象图片URL映射
const mbtiImages = {
    'INTJ': 'https://static.neris-assets.com/images/personality-types/avatars/intj-architect.svg',
    'INTP': 'https://static.neris-assets.com/images/personality-types/avatars/intp-logician.svg',
    'ENTJ': 'https://static.neris-assets.com/images/personality-types/avatars/entj-commander.svg',
    'ENTP': 'https://static.neris-assets.com/images/personality-types/avatars/entp-debater.svg',
    'INFJ': 'https://static.neris-assets.com/images/personality-types/avatars/infj-advocate.svg',
    'INFP': 'https://static.neris-assets.com/images/personality-types/avatars/infp-mediator.svg',
    'ENFJ': 'https://static.neris-assets.com/images/personality-types/avatars/enfj-protagonist.svg',
    'ENFP': 'https://static.neris-assets.com/images/personality-types/avatars/enfp-campaigner.svg',
    'ISTJ': 'https://static.neris-assets.com/images/personality-types/avatars/istj-logistician.svg',
    'ISFJ': 'https://static.neris-assets.com/images/personality-types/avatars/isfj-defender.svg',
    'ESTJ': 'https://static.neris-assets.com/images/personality-types/avatars/estj-executive.svg',
    'ESFJ': 'https://static.neris-assets.com/images/personality-types/avatars/esfj-consul.svg',
    'ISTP': 'https://static.neris-assets.com/images/personality-types/avatars/istp-virtuoso.svg',
    'ISFP': 'https://static.neris-assets.com/images/personality-types/avatars/isfp-adventurer.svg',
    'ESTP': 'https://static.neris-assets.com/images/personality-types/avatars/estp-entrepreneur.svg',
    'ESFP': 'https://static.neris-assets.com/images/personality-types/avatars/esfp-entertainer.svg'
};

// 更新MBTI形象图片
function updateMbtiImage(type) {
    const imageContainer = document.querySelector('.mbti-image');
    const image = imageContainer.querySelector('img');
    
    if (!type) {
        imageContainer.classList.remove('visible');
        return;
    }
    
    const imageUrl = mbtiImages[type];
    if (imageUrl) {
        image.src = imageUrl;
        image.alt = `${type} 形象`;
        imageContainer.classList.add('visible');
    }
}

// 主要的初始化代码
document.addEventListener('DOMContentLoaded', () => {
    const sceneContainer = document.querySelector('.scene-container');
    const linesContainer = document.getElementById('lines-container');
    const labelsContainer = document.getElementById('labels-container');
    let isDragging = false;
    let currentX;
    let currentY;
    let dragStartTime;
    let dragStartX;
    let dragStartY;
    const DRAG_THRESHOLD = window.innerWidth <= 800 ? 3 : 5; // 移动端降低拖动阈值
    const CLICK_THRESHOLD = 200;

    // 添加视口元数据
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    // 移动端初始化参数调整
    if (window.innerWidth <= 800) {
        initialRotateX = -15;  // 调整初始X轴旋转角度
        perspectiveParams.cameraDistance = 4;  // 调整相机距离
        autoRotateSpeed = 0.15;  // 降低自动旋转速度
    }

    // 创建所有线段
    edges.forEach(edge => {
        const line = createLine(edge.start, edge.end, edge.color);
        linesContainer.appendChild(line);
    });

    // 创建所有标签
    Object.entries(vertexPositions).forEach(([id, position]) => {
        const label = createLabel(id, position);
        labelsContainer.appendChild(label);
    });

    // 创建字母标签
    Object.entries(letterPositions).forEach(([letter, position]) => {
        const label = createLabel(letter, position, true);
        labelsContainer.appendChild(label);
    });

    // 创建MBTI类型标签
    Object.entries(mbtiTypePositions).forEach(([type, { base, aux }]) => {
        const label = createMbtiTypeLabel(type, base, aux);
        labelsContainer.appendChild(label);
    });

    // 处理窗口大小变化
    window.addEventListener('resize', () => {
        updateAllLabels(initialRotateX, initialRotateY);
        updateAllLines(initialRotateX, initialRotateY);
    });

    // 鼠标事件
    sceneContainer.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // 触摸事件
    sceneContainer.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', dragEnd);

    // 添加首次交互标记
    let hasInteracted = false;

    function dragStart(e) {
        isDragging = true;
        
        // 首次交互时永久停止自动旋转
        if (!hasInteracted) {
            hasInteracted = true;
            isAutoRotating = false;
        }
        
        dragStartTime = Date.now();
        
        if (e.type === 'mousedown') {
            currentX = dragStartX = e.clientX;
            currentY = dragStartY = e.clientY;
        } else if (e.type === 'touchstart') {
            currentX = dragStartX = e.touches[0].clientX;
            currentY = dragStartY = e.touches[0].clientY;
        }
    }

    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        let clientX, clientY;
        if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const deltaX = clientX - currentX;
        const deltaY = clientY - currentY;

        initialRotateY += deltaX * 0.5;
        initialRotateX -= deltaY * 0.5;

        // 限制X轴旋转角度
        initialRotateX = Math.max(-90, Math.min(90, initialRotateX));
        
        // 使用 requestAnimationFrame 更新场景
        requestAnimationFrame(() => {
            updateAllLabels(initialRotateX, initialRotateY);
            updateAllLines(initialRotateX, initialRotateY);
        });

        currentX = clientX;
        currentY = clientY;
    }

    function dragEnd(e) {
        if (!isDragging) return;
        
        const dragEndTime = Date.now();
        const dragDuration = dragEndTime - dragStartTime;
        
        let endX, endY;
        if (e.type === 'mouseup') {
            endX = e.clientX;
            endY = e.clientY;
        } else if (e.type === 'touchend') {
            endX = currentX;
            endY = currentY;
        }
        
        const totalDragDistance = Math.sqrt(
            Math.pow(endX - dragStartX, 2) + 
            Math.pow(endY - dragStartY, 2)
        );
        
        isDragging = false;
        
        // 不再在拖动结束时恢复自动旋转
        // isAutoRotating = true;
        
        // 如果拖动距离小于阈值且持续时间短于阈值，视为点击
        if (totalDragDistance < DRAG_THRESHOLD && dragDuration < CLICK_THRESHOLD) {
            const clickEvent = new MouseEvent('click', {
                clientX: endX,
                clientY: endY,
                bubbles: true,
                cancelable: true
            });
            e.target.dispatchEvent(clickEvent);
        }
    }
    
    // 初始化场景
    updateAllLabels(initialRotateX, initialRotateY);
    updateAllLines(initialRotateX, initialRotateY);
    
    // 启动自动旋转
    autoRotate();

    // 添加重置按钮事件监听
    document.querySelector('.reset-button').addEventListener('click', () => {
        resetView();
    });

    // 修改点击事件监听器
    document.addEventListener('click', async (e) => {
        // 如果正在拖动，忽略点击
        if (isDragging) return;
        
        // 首次交互时永久停止自动旋转
        if (!hasInteracted) {
            hasInteracted = true;
            isAutoRotating = false;
        }
        
        const mbtiLabel = e.target.closest('.mbti-type');
        if (mbtiLabel) {
            const type = mbtiLabel.textContent;
            
            // 更新功能位显示和MBTI形象
            updateFunctionsDisplay(type);
            updateMbtiImage(type);
            
            // 如果点击了不同的类型，先完全停止当前动画
            if (currentAnimation && currentAnimation !== type) {
                const oldAnimation = currentAnimation;
                currentAnimation = null;
                // 清理所有小球
                document.querySelectorAll('.function-ball').forEach(ball => ball.remove());
                functionBall = null;
                await new Promise(resolve => setTimeout(resolve, 300));
                if (!currentAnimation && oldAnimation !== type) {
                    currentAnimation = type;
                    animateCognitiveFunctions(type);
                }
            } else if (!currentAnimation) {
                currentAnimation = type;
                animateCognitiveFunctions(type);
            }
        } else if (!e.target.closest('.functions-panel') && !e.target.closest('.reset-button')) {
            // 点击空白处，隐藏功能位显示和MBTI形象
            const oldAnimation = currentAnimation;
            currentAnimation = null;
            updateFunctionsDisplay(null);
            updateMbtiImage(null);
            // 清理所有小球
            document.querySelectorAll('.function-ball').forEach(ball => ball.remove());
            functionBall = null;
            await new Promise(resolve => setTimeout(resolve, 300));
            if (!currentAnimation) {
                document.querySelectorAll('.label').forEach(l => {
                    l.classList.remove('highlight-green', 'highlight-yellow', 'highlight-blue', 'highlight-purple');
                });
                document.querySelectorAll('.mbti-type').forEach(label => {
                    label.classList.remove('selected-green', 'selected-yellow', 'selected-blue', 'selected-purple');
                });
            }
        }
    });
}); 