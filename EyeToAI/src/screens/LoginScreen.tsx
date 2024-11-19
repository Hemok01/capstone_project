// src/screens/LoginScreen.tsx

/**
 * 필요한 라이브러리와 컴포넌트들을 import
 * React Native의 기본 컴포넌트들과 Firebase 인증, Google 로그인 관련 기능들을 가져옴
 */
import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';
import auth from '@react-native-firebase/auth';
import {User} from '@react-native-google-signin/google-signin';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {SvgProps} from 'react-native-svg'; // 추가
import ItoaiLogo2 from '../assets/icons/itoai-icon2.svg'; // 추가

/**
 * 네비게이션 props 타입 정의
 * navigation: 화면 이동을 위한 네비게이션 객체
 * route: 현재 라우트 정보와 파라미터를 포함하는 객체
 */
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
  route: RouteProp<RootStackParamList, 'Login'>;
};

// 화면 너비를 가져와서 반응형 디자인에 활용
const windowWidth = Dimensions.get('window').width;

/**
 * 로그인 화면 컴포넌트
 * 이메일/비밀번호 로그인과 소셜 로그인(구글, 카카오)을 지원
 */
const LoginScreen = ({navigation, route}: Props) => {
  // 상태 관리를 위한 useState 훅 사용
  const [email, setEmail] = useState(''); // 이메일 입력 상태
  const [password, setPassword] = useState(''); // 비밀번호 입력 상태
  const [savePassword, setSavePassword] = useState(false); // 비밀번호 저장 여부

  /**
   * 컴포넌트 마운트 시 Google 로그인 설정
   * webClientId: Google Cloud Console에서 발급받은 클라이언트 ID
   * offlineAccess: 오프라인 액세스 허용
   * forceCodeForRefreshToken: 리프레시 토큰 강제 발급
   */
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '598185887142-etji8hhimolkl94k2fhfbi7d98e1tvcs.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      console.log('1. Google Play Services 확인 중...');
      await GoogleSignin.hasPlayServices();

      console.log('2. Google 로그인 시작...');
      const signInResult = await GoogleSignin.signIn();
      console.log('로그인 결과:', signInResult);

      console.log('3. 토큰 가져오기...');
      const {accessToken, idToken} = await GoogleSignin.getTokens();
      console.log('Access Token 존재:', !!accessToken);
      console.log('ID Token 존재:', !!idToken);

      // 수정: idToken이 아닌 accessToken과 idToken을 모두 사용
      if (!idToken) {
        throw new Error('ID token not found');
      }

      console.log('4. Firebase 인증 정보 생성...');
      // 이전 코드:
      // const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // 수정된 코드: idToken과 accessToken 모두 사용
      const googleCredential = auth.GoogleAuthProvider.credential(
        idToken,
        accessToken,
      );
      console.log('Firebase credential 생성 완료');

      console.log('5. Firebase 로그인 시도...');
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      console.log('Firebase 로그인 성공! UID:', userCredential.user.uid);

      Alert.alert('로그인 성공', '구글 로그인이 완료되었습니다!', [
        {
          text: '확인',
          onPress: () => {
            if (route.params.userType === 'parent') {
              navigation.replace('ParentDashboard', {
                userType: 'parent',
                userId: userCredential.user.uid,
              });
            } else {
              console.log('Child login - to be implemented');
            }
          },
        },
      ]);
    } catch (error: any) {
      console.error('로그인 에러 세부정보:', {
        code: error.code,
        message: error.message,
        fullError: error,
      });

      let errorMessage = '구글 로그인에 실패했습니다.';

      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = '로그인이 취소되었습니다.';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services가 설치되어 있지 않습니다.';
      } else if (error.code === 'DEVELOPER_ERROR') {
        errorMessage = '개발자 설정 오류입니다. SHA-1 인증서를 확인해주세요.';
      }

      Alert.alert('로그인 실패', errorMessage);
    }
  };
  /**
   * 일반 로그인 처리 함수
   * 현재는 테스트용 임시 구현 (이메일: 'a', 비밀번호: 'a')
   */
  const handleLogin = async () => {
    if (email === 'a' && password === 'a') {
      Alert.alert('로그인 성공', '로그인이 완료되었습니다!', [
        {
          text: '확인',
          onPress: () => {
            if (route.params.userType === 'parent') {
              navigation.replace('ParentDashboard', {
                userType: 'parent',
              });
            } else {
              console.log('Child login - to be implemented');
            }
          },
        },
      ]);
    }
  };

  // UI 렌더링
  return (
    <View style={styles.container}>
      {/* 앱 로고 섹션 */}
      <View style={styles.logoContainer}>
        <ItoaiLogo2 width={600} height={200} {...({} as SvgProps)} />
      </View>

      {/* 로그인 폼 섹션 */}
      <View style={styles.formContainer}>
        {/* 이메일 입력 필드 */}
        <TextInput
          style={styles.input}
          placeholder="아이디"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {/* 비밀번호 입력 필드 */}
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* 비밀번호 저장 체크박스 */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setSavePassword(!savePassword)}>
          <View style={styles.checkbox}>
            {savePassword && <View style={styles.checked} />}
          </View>
          <Text style={styles.checkboxLabel}>비밀번호 저장</Text>
        </TouchableOpacity>

        {/* 로그인 버튼 */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>

        {/* 도움말 링크 섹션 */}
        <View style={styles.helpLinks}>
          <Text style={styles.helpLinkText}>아이디 찾기</Text>
          <Text style={styles.helpLinkDivider}>|</Text>
          <Text style={styles.helpLinkText}>비밀번호 찾기</Text>
          <Text style={styles.helpLinkDivider}>|</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('SignUp', {userType: route.params.userType})
            }>
            <Text style={styles.helpLinkText}>회원가입</Text>
          </TouchableOpacity>
        </View>

        {/* SNS 로그인 섹션 */}
        <View style={styles.snsSection}>
          {/* SNS 로그인 헤더 */}
          <View style={styles.snsHeaderContainer}>
            <View style={styles.snsLine} />
            <Text style={styles.snsHeaderText}>SNS 간편 로그인</Text>
            <View style={styles.snsLine} />
          </View>

          {/* SNS 로그인 버튼들 */}
          <View style={styles.snsButtons}>
            <TouchableOpacity
              style={styles.snsButton}
              onPress={handleGoogleLogin}>
              <Image
                source={{
                  uri: 'https://img.icons8.com/color/200/google-logo.png',
                }}
                style={[styles.snsIcon, {backgroundColor: 'transparent'}]}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.snsButton}>
              <Image
                source={{
                  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAz1BMVEX74wA7Hh7/////6AD/6wD/6QD95QD/7AA2Fx4mAB86HB44Gh4oAB/74QAlAB81FR4zEh8iAB9jTBsuCB8vCx8tBR8xDx80FB8sAB8fAB+EbRdQNhyIcRb//OjXvwrkzAevmBHLswyjjBOpkhLWvgpwWRn974l8ZRjp0QZ1Xhi4oRCgiRNZQBv++tz987D862v85zXBqg5pURn862xAIx1KLxznzwaTfRX86Vf87Xz++dX+9br85zhUOxvx2QNdRBv98p3+9sEIACAWACBFKR1h91NFAAAOxklEQVR4nO2dCXeiSBDHUaC5RTwQovE2XjlGozGZ2ZDZnXz/z7QgNCK0oAg08ub/3u57k9FM/6jqrurqA6KM1tPzw8sP4lb04+Xh+ekECYH64fM7IeFu9MWSiPfn8wjvP3C39Qp93EcS3r/ibuSVevUz+ggfbs87/ZIeQgh/4m5dQvp5ivD37RvQlvQbTfhaFEAT8RVF+I67WYnqPUhYLEAPIiS85SCI1scxYWEGmYPgcGMTPhUP0NSThxB3W1LSgfABd1NS0gMkvC+kj5qS7h3CF9wtSU0vNuE97nakqPs9YfFC4UEfe0LcrUhVFuEv3I1IVb9MwqIlpMd6NwlxtyFllYliJmyupCfiGXcbUtYvoqgZG9QDcevVwyi9ErdTuo+nfwpPWHS+v/qrv/IJuMLdkmQFAEnSNEVRgJAkyTDM/xHA/CNFkzfPaqJRDGN0B/3hblr73H5vhGqzrsr8ZvtZm3SGi0FPYiiKvElO03AUmA1Gd5+cwonNhtpiBYHn+ZIlnhcEVlYbmljRtVpnMTZuDBMAmgLd0fRbFOtVoRQhVtU4rX3X7wKKvglK03bSeFlTuHqLj4I7yPTeirgempRkviFNPGMxZ7kGewGdK7nOlaYrIr+QlvUWa0W7xHZ+8VVRsyDzyAhoMJhqmhyfDqolqp0umTdDAma23HDV6/H24lWl3ZfyZEiSHEyUxhXOGZSgibu3nDACkl59VhLwTr/UyrTL5ICRJBclkU2ezxTf0mtd3HYEzKotJuqex5Ir6x5OOwJm/FWJTFquZNTvDGx2pIy5ko5/HkltDkkSBx8gR2JS4SFcvLYdY3BVqvcoZsJnSVCmUsZmBNQwCwc9SC0NMjUjPXvUsuQzxeud7OZWZohophDho9Rsz6iMAMmdnmIIPC22smCyACSlWtYe6krZZRAa6V4pmxiBlLiW0kakBlrKSUy41LaRbthgFni64EGtTS9NRGak4OUzxTa7dGqA1FLHzVeyJsepITJL/Ba0xCspIebBRW3xWip9kVrkwUVtCWkg0oO8WNASuzGSjotkL81ixeVqPSachwNjgzXQB1WfJpuGUzWMqRpaSj9JRGqZ3Xz+bFW6yY025LiSq05oSygRSXVFAEo564S2Gol1RabTwA2DVmWVjJ+S3TxFQq94LZHZIiDbufRRS+pdEn5KDbEVLaKldK83IjByDFhiH6+vTTEdFTdGmLirBxsw43BDhEpoX0tI5duE1xsRzJQcZjNeCZ/XDafULqfB/iBucI0RgZHsDos0JE+uMSLZR4UKgUVLluXjFTe5rmkq+hGpIndqd1FLFEWE5/DsicRDmV0RExlEOiNU2jWk1uv1pOZpNl9Z9werHY8aqrTdoLuaIKdk4nTc6y79T1aobCdtBcnYWMavvIFeMCMVNl2SOinG+GrBD7JjhiRJipgG/aAyYEhAMss6ArBv/hVgBpWjn7LfY5Khu1vUqqzwHb8josaZiCoXkDbOLll2Zn8QMHf+36J29pkIoDcBFxY+7SSF6XiLCmxpv1pBGohHYk2FY7spuQ24RWsekSZRS5unsoK+A0h/jUd0hj+qE6iNNIb218iBx4UFYXbyC9Z3dnHdFPQqwd8W5fTkorl/6l+M50c+P+Wch04PAz6iLRzLjw+EQhP6DT1CBS9hG3c0JUdBp6hGzVecVsOW7ltL+DbUQkLEP4Ag5Otux2DmLf8XLOlvMd2UWQfHcz6iOAIoe/iteyu2fue6iJDX3VWKU1Vp7+O8RACgyvjViXWAwJbrsPRhLJ3uTViFJZQ9CvBVCUIIm30/ITeG/wzZ09DBNdKxThF2kdOKamty56jj2IneTeeTvWpV21qVAbD/wi4zUN9HY80lhPoAth4Y/ImYL7TjDTVkv4n8fbxctaWyDiH1VW/Jeznxit/Y7aRlh3R4hHIBobI6AG5PbnER461ioIdmL+rGWTugar5I7Iy4oPuns28geDta9TibkNcXLqC0RY4yNuE4HuFXxL4uvnSKkOvZplvWZfsjzNEnziY8VO6B1A553vBblwlIpYh5xYFwfUwIgyG1FTjbTY9D4rmEyohxGxMGWFJjxXxgBOO9n5BAEzqjt5XWVh03lbxZNnSqCMLK0gUkPkN7TGseZzAF3fiEhuOkDTM9tT9D3XmaeB6huDsAPobXUoR2nJLbUWZ4ESEMhtSnYOWgtpsOPKHnLML/Om4fBF9RxSI1FuEqqlB6itCBstNaGI1JT692CYPxyCUcuCn+GYAlPRbhiXDoIeRdQvnox04w3AdBvm4PR96ZWAhhHRIaMDsEZC26VqTHWcBA5d1nEcLph1MgcKZK3tl0GOHIGfdhi4G0PqMYpsQJ+ecQSihCxQ6G4M1Oa6Gb0o+uK59DCAV652xyiVWruYRw4iFkvxwi5/u8YNvDg3MJIUEtzljci0d4Rj9EEcKpjJsSQTc9xNeLCAnmLupRx/VS/8z8TEKn04MZBIJuyrifuowQgM/IXeXxCKOjhYAghMGQHB2c0h5NyRUMsGcSwkOWYHZiXniQHifzPiPiowgrTpWJOeTt0E0JgYc/OIeQWcABNXrHmRYnHp6YAEcQwhkVmOnmdLG1lwZzHLiO5RIuQgiZ/iGrYXbhT1vYxiI0oh4czwYJGzvHSVfryWQ+n09N3d3BZ6ZEEw5hWW2hm9Nft0ITvicr3toFkISo2ROCUO85nuUtjMN2Mk4x40AY6OqQEPT+8CVeg0EAGELYdgm1E6tQQ39G7ME4EM4hIfsY9k/BYkYIIawI2zMb+YuGD2wc5lHxZsAENT1dNjhFGF7XAzO7mHE2YUlzZ1DUKGRYgL/wQkUmNR5C+Cya4XHJSe/OIXTq7Yq7/snMT+enMStRkeEiSNiaho9pDtIFhHwVNh5IyJUnS3FXn4ARlfPKho8wasXZKWaEES6PCUvVtbvCg1jrcz4TdwsfE1x6Cid0S1OA8ctppl3MgGtP5EKv15u2tGYVSVgSh25XPJWDxxxorIp1xNzaJXTGJBgMAWg06k1N00SR4yqKouv/OcUwMOY8hKA7GvVtLRb9TkNAEZb+uDtlmQ56ZIi9MgOiOmLLR1hxgiEY+ItYcAEMAGtRFBJa1ywdxPRaPIpQ2MAJPABIrxK+466uAakaHvN9hO4mM0S13F0ytBZQRXR3pcxcH0FYUifQT8ku6pnHq5Y6LQ+v6/sI3RoLwQeejNtyK86dIARGHUlY4tzSN4Oqw1+zyr0Kd1P1eKSBkyIwCAZnuDwEgHYyLwCSiiY03d/5AoUYGq7ZqQBAPdRNRaffOTUnbQVX2xEjFKzeEOLJzQCWD8KISg68gUT4diZSDCLPuma3CfKReX+3PZCTPdvUst1fAIHaJaTa+Re9H72ULgUCIumabKUn1mMCx0s5JXW+P41PGoi8Rr9mxxBqr4JXnLVlhpJgFU0bMjRJk3Nk7xUX5l8yvf2SPt8YWVfvQRl7dfeFX/bxjaEo0PHlAtrUWnrutYPdUF5ftXUvsG7mkzZdLHa8O3fSaqPFaIu2O8+th6MOPEVcF3meF6ydYtWqqlrhU3RuuWG1dafzHbCVys+njxyiNdft3DO7Q8TyTKt5tHONrTcbJxMhtlH3WJffC/m5KuoeO15uIYNh+8rN7HR+N+rbEmPuwzgYMSJg4JawvfpQSc6NeP1OdrMn5vXEjCW4hHCVqElEMQOnkjhRQoC3/BqxEa/G5hcV2LCbF/FqMveAAPCd08FGSeh03pmLlNlLjah7XaBcHgMuCWyCd9VQ69wd5S7xyjjBexWAIeeuK4rLRA/khy8b4FDjqqMyCFH9fCHK7cSOqruInTyNNkIr8Zs/CEDNo/ZmZCdeTOOCGgDO2ZyUjZRBKpcMnbXBLBPpq4RHGReRyAeikhagZcU1/r7IK4PUAC3EOe4RVdDGqd6ACahO1N7odCWrKd5HZyMyQ5yhv9GepX/bLrPK9n5dj3hxnngmgxLd+8ZzCwGvLDO6S5iUJjg6Y7We5iB6LMD0U7pKP0TcOuWbS49F9T6zLU/JlVHGd88Deshldx80L369ZeahrqjeV1YXDapan87WgLYAvRCi95hfL1afGtkb0BYt7bS0A4fAPY4xvsUDUEZHT3NZQxA3KywO6mWcoc/IJ8P3vcDzaosjUcHN2smINflAHl77RKVjw6pSW+Xk/WRkCuMpq4l3XQq/f+4VfZj2UgkNpbbI0Ru7oo+4XSS2zm2HbzlxT1vMOrEcnK9q+uOwR2EODz4BI5mQz7ea3Ga6MHKGR6B3Wl4ooVoX9c2038vnCyzpZUQJVRC1utpCvdNSkKsNTVSqn3ejQY5ftcpEHB1qbgerfmf+9a3pulKpcJzIcVzF2t1e2U7ulovBW47hLEWcyRCUnbVH3bqah6GNWa/b7Y7N/7q9mQEY5ibeeRx+0LSx8U4LfBtmMbb6EoVd/skrHZCTtOQKhdyirAqD/OQlsXU4sB0woH6X9bvgUtHJE+2qvMrDK0Sv19GtM94eOM+0tpmiaBlVbWs1FsUwoLXhDZWyVWpGygtg2Ql1dYYsFsaAhO8+DFviV1YvKcxCweM/LJf16kK6AuPjaMhrn70CGZAIXLDKKss8zu+u0fFxR63dK5SHEr73Qgh/djczXThb3hsJmm3sL0FPQYfD7IK+K8A8KSj37pPGN47XZqcveEOPoHSIIhrQLWA0Mn5hdoYi+6I1T8r8pefZCRjfolaUiS5aQOqPimvAvQB5G1naD9wNSFk/iH9wNyFl/UO84m5CynolHnA3IWU9EM+4m5CyfhFPEu42pCrpiSjjbkPKKhPld9xtSFXvJuEv3I1IVb9MwmK7adki/MDdihT1sSe8x92M9CTd7wnLL7gbkppeyjbhfVFDomXCPWG5qJnbQxkSFnU4LR8IfxbRT6WfHsLy7+IhSr/LXsJy8aaJr+VjwsKlp+9lP2HBEF1AD2H5ozh9UXotowiLM9zAQSZAWP6Ju2kJ6Wf5FKGZ3dy+GaWHYyQfYfn+1tPwl/tyOKHJ+EHcqiEl4sPPhyI09e/rDUJKxOu/KBgkoamn54eX21nS+PHy8Px0guR/CE9T15+oXogAAAAASUVORK5CYII=',
                }}
                style={[styles.snsIcon, {backgroundColor: 'transparent'}]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

/**
 * 스타일 정의
 * 컴포넌트의 레이아웃과 디자인을 설정
 */
const styles = StyleSheet.create({
  // 전체 컨테이너
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  // 로고 컨테이너

  logoContainer: {
    marginTop: '15%',
    marginBottom: '10%',
    alignItems: 'center',
  },

  // 폼 컨테이너
  formContainer: {
    width: windowWidth * 0.85,
  },
  // 입력 필드 스타일
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  // 체크박스 컨테이너
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  // 체크박스 스타일
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 체크된 상태 스타일
  checked: {
    width: 12,
    height: 12,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  // 체크박스 라벨
  checkboxLabel: {
    fontSize: 12,
    color: '#666',
  },
  // 로그인 버튼
  loginButton: {
    backgroundColor: '#AFE3F0',

    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  // 로그인 버튼 텍스트
  loginButtonText: {
    color: 'gray',
    fontSize: 16,
    fontWeight: '600',
  },
  // 도움말 링크 컨테이너
  helpLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  // 도움말 링크 텍스트
  helpLinkText: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 10,
  },
  // 도움말 링크 구분선
  helpLinkDivider: {
    fontSize: 12,
    color: '#D3D3D3',
  },
  // SNS 섹션
  snsSection: {
    alignItems: 'center',
  },
  // SNS 헤더 컨테이너
  snsHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  // SNS 구분선
  snsLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  // SNS 헤더 텍스트
  snsHeaderText: {
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#666',
  },
  // SNS 버튼 컨테이너
  snsButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  // SNS 버튼
  snsButton: {
    marginHorizontal: 10,
  },
  // SNS 아이콘
  snsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default LoginScreen;
