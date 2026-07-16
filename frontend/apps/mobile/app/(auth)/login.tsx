import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react-native';
import {
  AppLogo,
  InstitutionPill,
  RoleLegendBox,
  Input,
  Button,
  colors,
  spacing,
  typography,
  radii,
} from '@piiaura/ui';
import { APP_CONFIG } from '@piiaura/constants';
import { fetchTenantConfig } from '@piiaura/api';
import { useAuth } from '@piiaura/hooks';

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Phone, employee code, or admission number is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [institutionName, setInstitutionName] = useState<string>(APP_CONFIG.INSTITUTION_NAME);

  useEffect(() => {
    const subdomain = process.env.EXPO_PUBLIC_TENANT_SUBDOMAIN ?? 'greenfield';
    let cancelled = false;
    fetchTenantConfig(subdomain)
      .then((config) => {
        if (!cancelled && config.institutionName) {
          setInstitutionName(config.institutionName);
        }
      })
      .catch(() => {
        // Keep APP_CONFIG fallback when tenant-config is unreachable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const route = await login(data.identifier, data.password);
      router.replace(route as '/(faculty)/dashboard' | '/(student)/dashboard');
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.card}>
            <View style={styles.cardTopBorder} />

            <View style={styles.cardBody}>
              <View style={styles.header}>
                <AppLogo />
                <InstitutionPill name={institutionName} />
                <Text style={styles.title}>Login</Text>
              </View>

              <View style={styles.form}>
                <Controller
                  control={control}
                  name="identifier"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Phone / Employee Code / Admission Number"
                      placeholder="Phone / Employee Code / Admission"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.identifier?.message}
                    />
                  )}
                />

                <RoleLegendBox />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                      rightElement={
                        <Pressable
                          onPress={() => setShowPassword((prev) => !prev)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff size={20} color={colors.textMuted} />
                          ) : (
                            <Eye size={20} color={colors.textMuted} />
                          )}
                        </Pressable>
                      }
                    />
                  )}
                />

                <Button
                  label="Login"
                  fullWidth
                  loading={isLoading}
                  onPress={handleSubmit(onSubmit)}
                  style={styles.loginButton}
                />

                <Pressable
                  onPress={() => Alert.alert('Forgot password', 'Password reset will be available soon.')}
                  style={styles.forgotButton}
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>POWERED BY {APP_CONFIG.APP_NAME.toUpperCase()}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    flex: 1,
    minHeight: '100%',
  },
  cardTopBorder: {
    height: 5,
    backgroundColor: colors.primary,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.lg,
  },
  loginButton: {
    marginTop: spacing.sm,
    borderRadius: radii.md,
    minHeight: 52,
  },
  forgotButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  forgotText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  footer: {
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
});
