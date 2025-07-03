const explosivesData = {
    military: {
        name: "군용 폭발물",
        types: {
            "tnt": {
                name: "TNT (트리니트로톨루엔)",
                category: "군용 폭발물",
                dangerLevel: "high",
                detonationVelocity: "6,900 m/s",
                explosivePower: "TNT 당량 1.0 (기준)",
                appearance: "황색 결정성 고체, 주조 가능",
                characteristics: "안정성이 높고 취급이 용이하며, 다른 폭발물의 위력을 비교하는 기준으로 사용됨",
                precautions: "충격과 마찰에 비교적 안정적이나, 고온에서 폭발 위험성이 있음. 독성이 있어 피부 접촉 주의 필요"
            },
            "c4": {
                name: "C4 (컴포지션 C-4)",
                category: "군용 폭발물",
                dangerLevel: "high",
                detonationVelocity: "8,092 m/s",
                explosivePower: "TNT 당량 1.34",
                appearance: "백색 가소성 물질, 점토와 같은 성질",
                characteristics: "고성능 가소성 폭약, 성형성이 우수하고 방수성이 뛰어남",
                precautions: "기폭관 없이는 폭발하기 어려우나, 고온에서 폭발 위험성 있음"
            },
            "rdx": {
                name: "RDX (헥소겐)",
                category: "군용 폭발물",
                dangerLevel: "high",
                detonationVelocity: "8,750 m/s",
                explosivePower: "TNT 당량 1.6",
                appearance: "백색 결정성 고체",
                characteristics: "매우 강력한 폭발력, C4의 주요 성분",
                precautions: "충격과 마찰에 매우 민감하며, 취급 시 극도의 주의 필요"
            }
        }
    },
    commercial: {
        name: "상업용 폭발물",
        types: {
            "dynamite": {
                name: "다이너마이트",
                category: "상업용 폭발물",
                dangerLevel: "high",
                detonationVelocity: "3,000-7,000 m/s",
                explosivePower: "TNT 당량 0.6-0.8",
                appearance: "황갈색 고체, 지름 2.5cm 내외의 원통형",
                characteristics: "니트로글리세린을 주성분으로 하는 가장 보편적인 산업용 폭약",
                precautions: "충격, 마찰, 열에 민감하며 장기 보관 시 니트로글리세린이 흘러나올 수 있음"
            },
            "anfo": {
                name: "ANFO (질산암모늄 연료유)",
                category: "상업용 폭발물",
                dangerLevel: "medium",
                detonationVelocity: "3,200-4,400 m/s",
                explosivePower: "TNT 당량 0.74",
                appearance: "백색 또는 분홍색 구형 알갱이",
                characteristics: "저가의 산업용 폭약, 채광 및 건설현장에서 주로 사용",
                precautions: "수분에 취약하며, 기폭감도가 낮아 강력한 기폭약 필요"
            }
        }
    },
    homemade: {
        name: "자체제작 폭발물",
        types: {
            "acetone_peroxide": {
                name: "과산화아세톤(TATP)",
                category: "자체제작 폭발물",
                dangerLevel: "extreme",
                detonationVelocity: "5,300 m/s",
                explosivePower: "TNT 당량 0.88",
                appearance: "백색 결정성 분말",
                characteristics: "극도로 불안정하며 제조가 용이한 것이 특징",
                precautions: "극도로 민감하여 마찰, 충격, 열에 쉽게 폭발. 제조 및 취급 과정에서 높은 사고 위험"
            },
            "urea_nitrate": {
                name: "질산우레아",
                category: "자체제작 폭발물",
                dangerLevel: "high",
                detonationVelocity: "4,400-5,900 m/s",
                explosivePower: "TNT 당량 0.75",
                appearance: "무색 또는 백색 결정",
                characteristics: "비교적 안정적이나 강력한 폭발력 보유",
                precautions: "수분에 민감하며, 강산과 접촉 시 분해될 수 있음"
            }
        }
    }
};

// 폭발물 유형에 따른 하위 선택 옵션 업데이트
function updateExplosiveSubTypes(mainType) {
    const subSelect = document.getElementById('explosiveSubDetails');
    subSelect.style.display = mainType ? 'inline-block' : 'none';
    subSelect.innerHTML = '<option value="">세부 유형 선택</option>';
    
    if (mainType && explosivesData[mainType]) {
        const types = explosivesData[mainType].types;
        for (const [key, value] of Object.entries(types)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value.name;
            subSelect.appendChild(option);
        }
    }
}

// 폭발물 정보 표시
function displayExplosiveInfo(mainType, subType) {
    const infoPanel = document.getElementById('explosiveInfo');
    
    if (!mainType || !subType || !explosivesData[mainType]?.types[subType]) {
        infoPanel.style.display = 'none';
        return;
    }

    const explosiveInfo = explosivesData[mainType].types[subType];
    
    document.getElementById('explosiveName').textContent = explosiveInfo.name;
    document.getElementById('explosiveCategory').textContent = explosiveInfo.category;
    document.getElementById('dangerLevel').textContent = getDangerLevelText(explosiveInfo.dangerLevel);
    document.getElementById('detonationVelocity').textContent = explosiveInfo.detonationVelocity;
    document.getElementById('explosivePower').textContent = explosiveInfo.explosivePower;
    document.getElementById('appearance').textContent = explosiveInfo.appearance;
    document.getElementById('characteristics').textContent = explosiveInfo.characteristics;
    document.getElementById('precautions').textContent = explosiveInfo.precautions;

    // 위험등급에 따른 스타일 적용
    const dangerLevelSpan = document.getElementById('dangerLevel');
    dangerLevelSpan.className = `danger-level-${explosiveInfo.dangerLevel}`;
    
    infoPanel.style.display = 'block';
}

// 위험등급 텍스트 변환
function getDangerLevelText(level) {
    const levels = {
        'extreme': '극도로 위험',
        'high': '매우 위험',
        'medium': '위험',
        'low': '비교적 안전'
    };
    return levels[level] || level;
} 