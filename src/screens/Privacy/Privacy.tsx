import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

type PrivacyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Privacy'>;

const Privacy = () => {
  const navigation = useNavigation<PrivacyScreenNavigationProp>();

  return (
    <LinearGradient
      colors={['#9A4DD0', '#280061', '#020105']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Privacy Policy</Text>
          
          <Text style={styles.sectionTitle}>1. Camera and Gallery Access</Text>
          <Text style={styles.text}>
            This application requires access to your device's camera and photo gallery to provide its core functionality. We use these permissions only for:
            {'\n\n'}• Taking photos directly through the app
            {'\n'}• Selecting images from your gallery
            {'\n\n'}Your photos are processed only for the purpose of AI analysis and are not stored permanently on our servers.
          </Text>

          <Text style={styles.sectionTitle}>2. Data Usage</Text>
          <Text style={styles.text}>
            When you use our AI analysis feature:
            {'\n\n'}• Your images are temporarily processed to generate responses
            {'\n'}• The images are not stored or used for any other purpose
            {'\n'}• No personal data is extracted or stored from your images
            {'\n'}• The analysis results are generated using AI technology and are not stored
          </Text>

          <Text style={styles.sectionTitle}>3. AI Processing</Text>
          <Text style={styles.text}>
            Your images are processed using generative AI technology to provide analysis and responses. This processing is done in real-time and the images are not retained after the analysis is complete.
          </Text>

          <Text style={styles.sectionTitle}>4. Advertising and Google AdMob</Text>
          <Text style={styles.text}>
            This app uses Google AdMob for advertising purposes. By using this app, you agree to the following regarding advertising:
            {'\n\n'}• Google AdMob may collect and process data according to their privacy policy
            {'\n'}• This includes but is not limited to:
            {'\n'}  - Device information
            {'\n'}  - IP address
            {'\n'}  - Advertising identifiers
            {'\n'}  - Usage data
            {'\n\n'}• Google AdMob uses this information to:
            {'\n'}  - Show relevant advertisements
            {'\n'}  - Measure ad performance
            {'\n'}  - Improve ad targeting
            {'\n\n'}For more information about how Google uses your data, please visit Google's Privacy Policy at https://policies.google.com/privacy
          </Text>

          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.text}>
            We implement appropriate security measures to protect your data during transmission and processing. However, no method of transmission over the internet or electronic storage is 100% secure.
          </Text>

          <Text style={styles.sectionTitle}>6. Changes to Privacy Policy</Text>
          <Text style={styles.text}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 100,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Privacy; 